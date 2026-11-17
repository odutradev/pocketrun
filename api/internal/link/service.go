package link

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/group"
	"pocketrun-api/internal/slug"
	"pocketrun-api/internal/user"
)

const recordTimeout = 5 * time.Second

type Repository interface {
	Find(ctx context.Context, query ListQuery) ([]Link, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*Link, error)
	Insert(ctx context.Context, link *Link) error
	Replace(ctx context.Context, link *Link) error
	Delete(ctx context.Context, id bson.ObjectID) error
	UnsetGroup(ctx context.Context, groupID bson.ObjectID) error
	RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time) (*Link, error)
}

type EventRepository interface {
	InsertEvent(ctx context.Context, event *Event) error
	FindEvents(ctx context.Context, linkID bson.ObjectID, query HistoryQuery) ([]Event, error)
}

type OpenRepository interface {
	InsertOpen(ctx context.Context, open *Open) error
	FindOpens(ctx context.Context, linkID bson.ObjectID, from, to time.Time) ([]Open, error)
	DeleteOpens(ctx context.Context, linkID bson.ObjectID) error
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

type ActorFinder interface {
	GetUserByID(ctx context.Context, id bson.ObjectID) (*user.User, error)
}

type Dependencies struct {
	Repository Repository
	Events     EventRepository
	Opens      OpenRepository
	Slugs      SlugRegistry
	Groups     GroupChecker
	Actors     ActorFinder
	Logger     *slog.Logger
}

type Service struct {
	repository Repository
	events     EventRepository
	opens      OpenRepository
	slugs      SlugRegistry
	groups     GroupChecker
	actors     ActorFinder
	visitors   *VisitorHasher
	logger     *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository: dependencies.Repository,
		events:     dependencies.Events,
		opens:      dependencies.Opens,
		slugs:      dependencies.Slugs,
		groups:     dependencies.Groups,
		actors:     dependencies.Actors,
		visitors:   NewVisitorHasher(),
		logger:     dependencies.Logger,
	}
}

func (s *Service) List(ctx context.Context, query ListQuery) ([]Link, error) {
	links, err := s.repository.Find(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list links: %w", err)
	}

	now := time.Now()
	for index := range links {
		links[index].State = links[index].StateAt(now)
	}
	return links, nil
}

func (s *Service) GetByID(ctx context.Context, id bson.ObjectID) (*Link, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get link %s: %w", id.Hex(), err)
	}
	link.State = link.StateAt(time.Now())
	return link, nil
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

	s.record(ctx, newEvent(link.ID, EventCreated, s.actor(ctx), snapshot(*link), now))
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
		s.record(ctx, newEvent(link.ID, EventUpdated, s.actor(ctx), changes, link.UpdatedAt))
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

	s.record(ctx, newEvent(link.ID, EventDeleted, s.actor(ctx), nil, time.Now()))
	if err := s.opens.DeleteOpens(ctx, link.ID); err != nil {
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
		changes := []Change{{Field: "groupId", From: groupID.Hex(), To: nil}}
		s.record(ctx, newEvent(member.ID, EventGroupDetached, actor, changes, now))
	}
	return nil
}

func (s *Service) History(ctx context.Context, id bson.ObjectID, query HistoryQuery) (HistoryPage, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil && !errors.Is(err, ErrLinkNotFound) {
		return HistoryPage{}, fmt.Errorf("link history %s: %w", id.Hex(), err)
	}

	lookup := query
	lookup.Limit = query.Limit + 1
	events, err := s.events.FindEvents(ctx, id, lookup)
	if err != nil {
		return HistoryPage{}, fmt.Errorf("link history %s: %w", id.Hex(), err)
	}

	if expired := expirationEvent(link, query.Before, time.Now()); expired != nil {
		events = append(events, *expired)
		sort.SliceStable(events, func(i, j int) bool { return events[i].At.After(events[j].At) })
	}

	page := HistoryPage{Events: events}
	if len(events) > query.Limit {
		page.Events = events[:query.Limit]
		cursor := page.Events[query.Limit-1].At
		page.NextCursor = &cursor
	}
	return page, nil
}

func (s *Service) Analytics(ctx context.Context, id bson.ObjectID, query AnalyticsQuery) (Analytics, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return Analytics{}, fmt.Errorf("link analytics %s: %w", id.Hex(), err)
	}

	to := time.Now()
	from := link.CreatedAt
	span := query.Range.Duration()
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.opens.FindOpens(ctx, id, from, to)
	if err != nil {
		return Analytics{}, fmt.Errorf("link analytics %s: %w", id.Hex(), err)
	}
	analytics := buildAnalytics(query, from, to, opens)
	if span == 0 {
		return analytics, nil
	}

	previous, err := s.opens.FindOpens(ctx, id, from.Add(-span), from)
	if err != nil {
		return Analytics{}, fmt.Errorf("link analytics %s: %w", id.Hex(), err)
	}
	clicks, visitors := summarize(previous)
	analytics.Totals.PreviousClicks = &clicks
	analytics.Totals.PreviousVisitors = &visitors
	return analytics, nil
}

func (s *Service) Open(ctx context.Context, value string, visit Visit) (*Link, error) {
	entry, err := s.slugs.Find(ctx, value)
	if errors.Is(err, slug.ErrSlugNotFound) {
		return nil, ErrLinkNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("open link %s: %w", value, err)
	}

	if entry.Kind != slug.KindLink {
		return nil, ErrLinkNotFound
	}

	now := time.Now()
	link, err := s.repository.RegisterOpen(ctx, entry.TargetID, now)
	if err != nil {
		return nil, fmt.Errorf("open link %s: %w", value, err)
	}

	go s.recordOpen(context.WithoutCancel(ctx), *link, visit, now)
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

func (s *Service) recordOpen(ctx context.Context, link Link, visit Visit, at time.Time) {
	ctx, cancel := context.WithTimeout(ctx, recordTimeout)
	defer cancel()

	visitor, err := s.visitors.Hash(visit, at)
	if err != nil {
		s.logger.WarnContext(ctx, "hash link visitor", "linkId", link.ID.Hex(), "error", err)
	}
	if err := s.opens.InsertOpen(ctx, newOpen(link.ID, visit, visitor, at)); err != nil {
		s.logger.WarnContext(ctx, "record link open", "linkId", link.ID.Hex(), "error", err)
	}

	if link.Mode == ModeClicks && link.MaxClicks != nil && link.Clicks+1 == *link.MaxClicks {
		s.record(ctx, newEvent(link.ID, EventExhausted, systemActor(), nil, at))
	}
}

func (s *Service) record(ctx context.Context, event *Event) {
	if err := s.events.InsertEvent(ctx, event); err != nil {
		s.logger.WarnContext(ctx, "record link event", "linkId", event.LinkID.Hex(), "type", event.Type, "error", err)
	}
}

func (s *Service) actor(ctx context.Context) Actor {
	claims, ok := user.ClaimsFromContext(ctx)
	if !ok {
		return systemActor()
	}

	actor := Actor{Name: claims.Email, Email: claims.Email}
	id, err := bson.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return actor
	}
	actor.ID = &id

	member, err := s.actors.GetUserByID(ctx, id)
	if err != nil {
		s.logger.WarnContext(ctx, "resolve link event actor", "userId", claims.UserID, "error", err)
		return actor
	}
	actor.Name = member.Name
	actor.Email = member.Email
	return actor
}

func expirationEvent(link *Link, before *time.Time, now time.Time) *Event {
	if link == nil || link.Mode != ModePeriod || link.EndsAt == nil || link.EndsAt.After(now) {
		return nil
	}
	if before != nil && !link.EndsAt.Before(*before) {
		return nil
	}

	event := newEvent(link.ID, EventExpired, systemActor(), nil, *link.EndsAt)
	event.ID = bson.NewObjectIDFromTimestamp(*link.EndsAt)
	return event
}
