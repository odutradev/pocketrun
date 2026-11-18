package link

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/group"
	"pocketrun-api/internal/link/analytics"
	"pocketrun-api/internal/link/history"
	"pocketrun-api/internal/platform/traffic"
	"pocketrun-api/internal/slug"
	"pocketrun-api/internal/user"
)

const recordTimeout = 5 * time.Second

type Repository interface {
	Find(ctx context.Context, query ListQuery) ([]Link, error)
	Count(ctx context.Context, query ListQuery) (int64, error)
	Totals(ctx context.Context) ([]GroupTotals, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*Link, error)
	FindByIDs(ctx context.Context, ids []bson.ObjectID) ([]Link, error)
	Insert(ctx context.Context, link *Link) error
	Replace(ctx context.Context, link *Link) error
	Delete(ctx context.Context, id bson.ObjectID) error
	UnsetGroup(ctx context.Context, groupID bson.ObjectID) error
	RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time, isCounted bool) (*Link, error)
}

type EventRecorder interface {
	Record(ctx context.Context, event *history.Event)
}

type OpenTracker interface {
	Record(ctx context.Context, linkID bson.ObjectID, visit traffic.Visit, at time.Time) error
	DeleteAll(ctx context.Context, linkID bson.ObjectID) error
}

type SlugRegistry interface {
	Check(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error)
	Find(ctx context.Context, value string) (*slug.Entry, error)
	Reserve(ctx context.Context, value string, kind slug.Kind, targetID bson.ObjectID) error
	ReserveRandom(ctx context.Context, kind slug.Kind, targetID bson.ObjectID) (string, error)
	Release(ctx context.Context, value string, targetID bson.ObjectID) error
}

type GroupChecker interface {
	Ensure(ctx context.Context, kind group.Kind, id bson.ObjectID) error
}

type ActorResolver interface {
	Actor(ctx context.Context) (user.Actor, error)
}

type Dependencies struct {
	Repository Repository
	History    EventRecorder
	Opens      OpenTracker
	Slugs      SlugRegistry
	Groups     GroupChecker
	Actors     ActorResolver
	Logger     *slog.Logger
}

type Service struct {
	repository Repository
	history    EventRecorder
	opens      OpenTracker
	slugs      SlugRegistry
	groups     GroupChecker
	actors     ActorResolver
	logger     *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository: dependencies.Repository,
		history:    dependencies.History,
		opens:      dependencies.Opens,
		slugs:      dependencies.Slugs,
		groups:     dependencies.Groups,
		actors:     dependencies.Actors,
		logger:     dependencies.Logger,
	}
}

func (s *Service) List(ctx context.Context, query ListQuery) (ListPage, error) {
	query.Now = time.Now()
	links, err := s.repository.Find(ctx, query)
	if err != nil {
		return ListPage{}, fmt.Errorf("list links: %w", err)
	}

	total, err := s.repository.Count(ctx, query)
	if err != nil {
		return ListPage{}, fmt.Errorf("list links: %w", err)
	}

	for index := range links {
		links[index].State = links[index].StateAt(query.Now)
	}
	return newListPage(links, total, query), nil
}

func (s *Service) Summary(ctx context.Context) (Summary, error) {
	totals, err := s.repository.Totals(ctx)
	if err != nil {
		return Summary{}, fmt.Errorf("summarize links: %w", err)
	}

	summary := Summary{Groups: []GroupTotals{}}
	for _, item := range totals {
		summary.Total += item.Links
		if item.GroupID == nil {
			summary.Ungrouped += item.Links
			continue
		}
		summary.Groups = append(summary.Groups, item)
	}
	return summary, nil
}

func (s *Service) GetByID(ctx context.Context, id bson.ObjectID) (*Link, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get link %s: %w", id.Hex(), err)
	}
	link.State = link.StateAt(time.Now())
	return link, nil
}

func (s *Service) ExpiredAt(ctx context.Context, id bson.ObjectID) (*time.Time, error) {
	link, err := s.repository.FindByID(ctx, id)
	if errors.Is(err, ErrLinkNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("link expiry %s: %w", id.Hex(), err)
	}
	if !link.Rule().ExpiredBefore(time.Now()) {
		return nil, nil
	}
	return link.EndsAt, nil
}

func (s *Service) Targets(ctx context.Context, ids []bson.ObjectID) ([]analytics.Target, error) {
	links, err := s.repository.FindByIDs(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("find analytics links: %w", err)
	}

	targets := make([]analytics.Target, 0, len(links))
	for _, link := range links {
		targets = append(targets, analytics.Target{ID: link.ID, Title: link.Title, Slug: link.Slug, CreatedAt: link.CreatedAt})
	}
	return targets, nil
}

func (s *Service) CheckSlug(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error) {
	availability, err := s.slugs.Check(ctx, value, ownerID)
	if err != nil {
		return slug.Availability{}, fmt.Errorf("check link slug: %w", err)
	}
	return availability, nil
}

func (s *Service) Create(ctx context.Context, managerID bson.ObjectID, input Input) (*Link, error) {
	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("create link: %w", err)
	}

	now := time.Now()
	link := &Link{
		ID:        bson.NewObjectID(),
		Title:     input.Title,
		URL:       input.URL,
		GroupID:   groupID,
		Mode:      input.Mode,
		StartsAt:  input.StartsAt,
		EndsAt:    input.EndsAt,
		MaxClicks: input.MaxClicks,
		CreatedBy: managerID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	link.Slug, err = s.reserveSlug(ctx, input.Slug, link.ID)
	if err != nil {
		return nil, fmt.Errorf("create link: %w", err)
	}

	if err := s.repository.Insert(ctx, link); err != nil {
		return nil, errors.Join(fmt.Errorf("create link: %w", err), s.slugs.Release(ctx, link.Slug, link.ID))
	}

	s.history.Record(ctx, history.NewEvent(link.ID, history.EventCreated, s.actor(ctx), snapshot(*link), now))
	link.State = link.StateAt(now)
	return link, nil
}

func (s *Service) Update(ctx context.Context, id bson.ObjectID, input Input) (*Link, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
	}

	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
	}

	previous := *link
	previousSlug := link.Slug
	nextSlug := input.Slug
	if nextSlug == "" {
		nextSlug = previousSlug
	}
	if nextSlug != previousSlug {
		if err := s.slugs.Reserve(ctx, nextSlug, slug.KindLink, link.ID); err != nil {
			return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
		}
	}

	link.Title = input.Title
	link.Slug = nextSlug
	link.URL = input.URL
	link.GroupID = groupID
	link.Mode = input.Mode
	link.StartsAt = input.StartsAt
	link.EndsAt = input.EndsAt
	link.MaxClicks = input.MaxClicks
	link.UpdatedAt = time.Now()

	if err := s.repository.Replace(ctx, link); err != nil {
		if nextSlug != previousSlug {
			err = errors.Join(err, s.slugs.Release(ctx, nextSlug, link.ID))
		}
		return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
	}

	if nextSlug != previousSlug {
		if err := s.slugs.Release(ctx, previousSlug, link.ID); err != nil {
			return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
		}
	}

	if changes := diff(previous, *link); len(changes) > 0 {
		s.history.Record(ctx, history.NewEvent(link.ID, history.EventUpdated, s.actor(ctx), changes, link.UpdatedAt))
	}
	link.State = link.StateAt(link.UpdatedAt)
	return link, nil
}

func (s *Service) Delete(ctx context.Context, id bson.ObjectID) error {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("delete link %s: %w", id.Hex(), err)
	}

	if err := s.repository.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete link %s: %w", id.Hex(), err)
	}

	if err := s.slugs.Release(ctx, link.Slug, link.ID); err != nil {
		return fmt.Errorf("delete link %s: %w", id.Hex(), err)
	}

	s.history.Record(ctx, history.NewEvent(link.ID, history.EventDeleted, s.actor(ctx), nil, time.Now()))
	if err := s.opens.DeleteAll(ctx, link.ID); err != nil {
		s.logger.WarnContext(ctx, "delete link opens", "linkId", link.ID.Hex(), "error", err)
	}
	return nil
}

func (s *Service) DetachGroup(ctx context.Context, groupID bson.ObjectID) error {
	members, err := s.repository.Find(ctx, ListQuery{GroupID: &groupID})
	if err != nil {
		return fmt.Errorf("detach links from group %s: %w", groupID.Hex(), err)
	}

	if err := s.repository.UnsetGroup(ctx, groupID); err != nil {
		return fmt.Errorf("detach links from group %s: %w", groupID.Hex(), err)
	}

	actor := s.actor(ctx)
	now := time.Now()
	for _, member := range members {
		changes := []history.Change{{Field: "groupId", From: groupID.Hex(), To: nil}}
		s.history.Record(ctx, history.NewEvent(member.ID, history.EventGroupDetached, actor, changes, now))
	}
	return nil
}

func (s *Service) Resolve(ctx context.Context, value string) (*slug.Entry, error) {
	value = NormalizeSlug(value)
	entry, err := s.slugs.Find(ctx, value)
	if errors.Is(err, slug.ErrSlugNotFound) {
		return nil, ErrLinkNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("resolve slug %s: %w", value, err)
	}
	return entry, nil
}

func (s *Service) Open(ctx context.Context, value string, visit traffic.Visit) (*Link, error) {
	value = NormalizeSlug(value)
	entry, err := s.slugs.Find(ctx, value)
	if errors.Is(err, slug.ErrSlugNotFound) {
		return nil, ErrLinkNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("open link %s: %w", value, err)
	}

	if entry.Kind != slug.KindLink {
		return nil, &KindError{Kind: entry.Kind, TargetID: entry.TargetID}
	}

	now := time.Now()
	isCounted := !visit.IsBot()
	link, err := s.repository.RegisterOpen(ctx, entry.TargetID, now, isCounted)
	if err != nil {
		return nil, fmt.Errorf("open link %s: %w", value, err)
	}

	go s.recordOpen(context.WithoutCancel(ctx), *link, visit, now, isCounted)
	return link, nil
}

func (s *Service) prepareInput(ctx context.Context, input Input) (*bson.ObjectID, error) {
	if err := input.CheckSchedule(); err != nil {
		return nil, fmt.Errorf("check link schedule: %w", err)
	}

	if input.GroupID == "" {
		return nil, nil
	}

	groupID, err := group.ParseID(input.GroupID)
	if err != nil {
		return nil, fmt.Errorf("parse link group id: %w", err)
	}

	if err := s.groups.Ensure(ctx, group.KindLinks, groupID); err != nil {
		return nil, fmt.Errorf("resolve link group: %w", err)
	}
	return &groupID, nil
}

func (s *Service) reserveSlug(ctx context.Context, value string, targetID bson.ObjectID) (string, error) {
	if value == "" {
		reserved, err := s.slugs.ReserveRandom(ctx, slug.KindLink, targetID)
		if err != nil {
			return "", fmt.Errorf("reserve link slug: %w", err)
		}
		return reserved, nil
	}

	if err := s.slugs.Reserve(ctx, value, slug.KindLink, targetID); err != nil {
		return "", fmt.Errorf("reserve link slug: %w", err)
	}
	return value, nil
}

func (s *Service) recordOpen(ctx context.Context, link Link, visit traffic.Visit, at time.Time, isCounted bool) {
	ctx, cancel := context.WithTimeout(ctx, recordTimeout)
	defer cancel()

	if err := s.opens.Record(ctx, link.ID, visit, at); err != nil {
		s.logger.WarnContext(ctx, "record link open", "linkId", link.ID.Hex(), "error", err)
	}

	if isCounted && link.Rule().ExhaustedBy(link.Clicks+1) {
		s.history.Record(ctx, history.NewEvent(link.ID, history.EventExhausted, user.SystemActor(), nil, at))
	}
}

func (s *Service) actor(ctx context.Context) user.Actor {
	actor, err := s.actors.Actor(ctx)
	if err != nil {
		s.logger.WarnContext(ctx, "resolve link event actor", "error", err)
	}
	return actor
}
