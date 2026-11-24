package page

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/group"
	"pocketrun-api/internal/domains/page/history"
	"pocketrun-api/internal/domains/page/version"
	eventrepository "pocketrun-api/internal/repositories/event"
	grouprepository "pocketrun-api/internal/repositories/group"
	pagerepository "pocketrun-api/internal/repositories/page"
	pageversionrepository "pocketrun-api/internal/repositories/pageversion"
	slugrepository "pocketrun-api/internal/repositories/slug"
	userrepository "pocketrun-api/internal/repositories/user"
	"pocketrun-api/internal/services/activation"
	analyticsservice "pocketrun-api/internal/services/analytics"
	historyservice "pocketrun-api/internal/services/history"
	"pocketrun-api/internal/services/slug"
	"pocketrun-api/internal/services/traffic"
)

const recordTimeout = 5 * time.Second

type Repository interface {
	Find(ctx context.Context, query pagerepository.ListQuery) ([]pagerepository.Page, error)
	Count(ctx context.Context, query pagerepository.ListQuery) (int64, error)
	Totals(ctx context.Context) ([]pagerepository.GroupTotals, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error)
	FindByIDs(ctx context.Context, ids []bson.ObjectID) ([]pagerepository.Page, error)
	Insert(ctx context.Context, page *pagerepository.Page) error
	Replace(ctx context.Context, page *pagerepository.Page) error
	Delete(ctx context.Context, id bson.ObjectID) error
	UnsetGroup(ctx context.Context, groupID bson.ObjectID) error
	RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time, isCounted bool) (*pagerepository.Page, error)
	CountVisitor(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error)
}

type UniqueTracker interface {
	Register(ctx context.Context, targetID bson.ObjectID, visit traffic.Visit) (bool, error)
	Forget(ctx context.Context, targetID bson.ObjectID) error
}

type VersionKeeper interface {
	Save(ctx context.Context, version *pageversionrepository.Version)
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type EventRecorder interface {
	Record(ctx context.Context, event *eventrepository.Event)
}

type OpenTracker interface {
	Record(ctx context.Context, pageID bson.ObjectID, visit traffic.Visit, at time.Time) error
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type AccessCleaner interface {
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type BindingCleaner interface {
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type SlugRegistry interface {
	Check(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error)
	Reserve(ctx context.Context, value string, kind slugrepository.Kind, targetID bson.ObjectID) error
	ReserveRandom(ctx context.Context, kind slugrepository.Kind, targetID bson.ObjectID) (string, error)
	Release(ctx context.Context, value string, targetID bson.ObjectID) error
}

type GroupChecker interface {
	Ensure(ctx context.Context, kind grouprepository.Kind, id bson.ObjectID) error
}

type ActorResolver interface {
	Actor(ctx context.Context) (userrepository.Actor, error)
}

type Dependencies struct {
	Repository Repository
	Versions   VersionKeeper
	History    EventRecorder
	Opens      OpenTracker
	Uniques    UniqueTracker
	Access     AccessCleaner
	Bindings   BindingCleaner
	Slugs      SlugRegistry
	Groups     GroupChecker
	Actors     ActorResolver
	Logger     *slog.Logger
}

type Service struct {
	repository Repository
	versions   VersionKeeper
	history    EventRecorder
	opens      OpenTracker
	uniques    UniqueTracker
	access     AccessCleaner
	bindings   BindingCleaner
	slugs      SlugRegistry
	groups     GroupChecker
	actors     ActorResolver
	logger     *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository: dependencies.Repository,
		versions:   dependencies.Versions,
		history:    dependencies.History,
		opens:      dependencies.Opens,
		uniques:    dependencies.Uniques,
		access:     dependencies.Access,
		bindings:   dependencies.Bindings,
		slugs:      dependencies.Slugs,
		groups:     dependencies.Groups,
		actors:     dependencies.Actors,
		logger:     dependencies.Logger,
	}
}

func (s *Service) List(ctx context.Context, query pagerepository.ListQuery) (ListPage, error) {
	query.Now = time.Now()
	pages, err := s.repository.Find(ctx, query)
	if err != nil {
		return ListPage{}, fmt.Errorf("list pages: %w", err)
	}

	total, err := s.repository.Count(ctx, query)
	if err != nil {
		return ListPage{}, fmt.Errorf("list pages: %w", err)
	}

	for index := range pages {
		pages[index].State = pages[index].StateAt(query.Now)
	}
	return newListPage(pages, total, query), nil
}

func (s *Service) Summary(ctx context.Context) (Summary, error) {
	totals, err := s.repository.Totals(ctx)
	if err != nil {
		return Summary{}, fmt.Errorf("summarize pages: %w", err)
	}

	summary := Summary{Groups: []pagerepository.GroupTotals{}}
	for _, item := range totals {
		summary.Total += item.Pages
		if item.GroupID == nil {
			summary.Ungrouped += item.Pages
			continue
		}
		summary.Groups = append(summary.Groups, item)
	}
	return summary, nil
}

func (s *Service) GetByID(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get page %s: %w", id.Hex(), err)
	}
	page.State = page.StateAt(time.Now())
	return page, nil
}

func (s *Service) Visible(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find visible page %s: %w", id.Hex(), err)
	}
	if page.StateAt(time.Now()) != activation.StateActive {
		return nil, fmt.Errorf("find visible page %s: %w", id.Hex(), ErrPageUnavailable)
	}
	return page, nil
}

func (s *Service) Exists(ctx context.Context, id bson.ObjectID) (bool, error) {
	_, err := s.repository.FindByID(ctx, id)
	if errors.Is(err, ErrPageNotFound) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check page %s: %w", id.Hex(), err)
	}
	return true, nil
}

func (s *Service) ExpiredAt(ctx context.Context, id bson.ObjectID) (*time.Time, error) {
	page, err := s.repository.FindByID(ctx, id)
	if errors.Is(err, ErrPageNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("page expiry %s: %w", id.Hex(), err)
	}
	if !page.Rule().ExpiredBefore(time.Now()) {
		return nil, nil
	}
	return page.EndsAt, nil
}

func (s *Service) Targets(ctx context.Context, ids []bson.ObjectID) ([]analyticsservice.Target, error) {
	pages, err := s.repository.FindByIDs(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("find analytics pages: %w", err)
	}

	targets := make([]analyticsservice.Target, 0, len(pages))
	for _, page := range pages {
		targets = append(targets, analyticsservice.Target{ID: page.ID, Title: page.Title, Slug: page.Slug, CreatedAt: page.CreatedAt})
	}
	return targets, nil
}

func (s *Service) CheckSlug(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error) {
	availability, err := s.slugs.Check(ctx, value, ownerID)
	if err != nil {
		return slug.Availability{}, fmt.Errorf("check page slug: %w", err)
	}
	return availability, nil
}

func (s *Service) Create(ctx context.Context, managerID bson.ObjectID, input Input) (*pagerepository.Page, error) {
	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("create page: %w", err)
	}

	html := ""
	if input.HTML != nil {
		html = *input.HTML
	}

	now := time.Now()
	page := &pagerepository.Page{
		ID:        bson.NewObjectID(),
		Title:     input.Title,
		HTML:      html,
		Size:      int64(len(html)),
		Version:   1,
		GroupID:   groupID,
		Mode:      input.Mode,
		StartsAt:  input.StartsAt,
		EndsAt:    input.EndsAt,
		MaxClicks: input.MaxClicks,
		CountBy:   input.CountBy,
		CreatedBy: managerID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	page.Slug, err = s.reserveSlug(ctx, input.Slug, page.ID)
	if err != nil {
		return nil, fmt.Errorf("create page: %w", err)
	}

	if err := s.repository.Insert(ctx, page); err != nil {
		return nil, errors.Join(fmt.Errorf("create page: %w", err), s.slugs.Release(ctx, page.Slug, page.ID))
	}

	actor := s.actor(ctx)
	s.versions.Save(ctx, version.New(page.ID, page.Version, page.HTML, input.Message, nil, actor, now))
	s.history.Record(ctx, history.NewEvent(page.ID, historyservice.EventCreated, actor, snapshot(*page), now))
	page.State = page.StateAt(now)
	return page, nil
}

func (s *Service) Update(ctx context.Context, id bson.ObjectID, input Input) (*pagerepository.Page, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("update page %s: %w", id.Hex(), err)
	}

	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("update page %s: %w", id.Hex(), err)
	}

	previous := *page
	nextSlug := input.Slug
	if nextSlug == "" {
		nextSlug = previous.Slug
	}
	if nextSlug != previous.Slug {
		if err := s.slugs.Reserve(ctx, nextSlug, slugrepository.KindPage, page.ID); err != nil {
			return nil, fmt.Errorf("update page %s: %w", id.Hex(), err)
		}
	}

	isNewVersion := input.HTML != nil && *input.HTML != previous.HTML
	page.Title = input.Title
	page.Slug = nextSlug
	page.GroupID = groupID
	page.Mode = input.Mode
	page.StartsAt = input.StartsAt
	page.EndsAt = input.EndsAt
	page.MaxClicks = input.MaxClicks
	page.CountBy = input.CountBy
	page.UpdatedAt = time.Now()
	if isNewVersion {
		page.HTML = *input.HTML
		page.Size = int64(len(page.HTML))
		page.Version = previous.Version + 1
	}

	if err := s.repository.Replace(ctx, page); err != nil {
		if nextSlug != previous.Slug {
			err = errors.Join(err, s.slugs.Release(ctx, nextSlug, page.ID))
		}
		return nil, fmt.Errorf("update page %s: %w", id.Hex(), err)
	}

	if nextSlug != previous.Slug {
		if err := s.slugs.Release(ctx, previous.Slug, page.ID); err != nil {
			return nil, fmt.Errorf("update page %s: %w", id.Hex(), err)
		}
	}

	actor := s.actor(ctx)
	if isNewVersion {
		restored := restoredFrom(input.RestoredFrom, page.Version)
		s.versions.Save(ctx, version.New(page.ID, page.Version, page.HTML, input.Message, restored, actor, page.UpdatedAt))
	}
	if changes := diff(previous, *page); len(changes) > 0 {
		s.history.Record(ctx, history.NewEvent(page.ID, historyservice.EventUpdated, actor, changes, page.UpdatedAt))
	}
	page.State = page.StateAt(page.UpdatedAt)
	return page, nil
}

func (s *Service) SetStatus(ctx context.Context, id bson.ObjectID, isActive bool) (*pagerepository.Page, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("set page %s status: %w", id.Hex(), err)
	}

	previous := *page
	page.Mode = activation.ModeInactive
	if isActive {
		page.Mode = activation.ModeActive
	}
	page.StartsAt, page.EndsAt, page.MaxClicks, page.CountBy = nil, nil, nil, ""
	page.UpdatedAt = time.Now()

	changes := diff(previous, *page)
	if len(changes) == 0 {
		page.State = page.StateAt(page.UpdatedAt)
		return page, nil
	}

	if err := s.repository.Replace(ctx, page); err != nil {
		return nil, fmt.Errorf("set page %s status: %w", id.Hex(), err)
	}
	s.history.Record(ctx, history.NewEvent(page.ID, historyservice.EventUpdated, s.actor(ctx), changes, page.UpdatedAt))
	page.State = page.StateAt(page.UpdatedAt)
	return page, nil
}

func (s *Service) Delete(ctx context.Context, id bson.ObjectID) error {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("delete page %s: %w", id.Hex(), err)
	}

	if err := s.repository.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete page %s: %w", id.Hex(), err)
	}

	if err := s.slugs.Release(ctx, page.Slug, page.ID); err != nil {
		return fmt.Errorf("delete page %s: %w", id.Hex(), err)
	}

	s.history.Record(ctx, history.NewEvent(page.ID, historyservice.EventDeleted, s.actor(ctx), nil, time.Now()))
	if err := s.uniques.Forget(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "forget page unique visitors", "pageId", page.ID.Hex(), "error", err)
	}
	if err := s.opens.DeleteAll(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "delete page opens", "pageId", page.ID.Hex(), "error", err)
	}
	if err := s.versions.DeleteAll(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "delete page versions", "pageId", page.ID.Hex(), "error", err)
	}
	if err := s.access.DeleteAll(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "delete page access", "pageId", page.ID.Hex(), "error", err)
	}
	if err := s.bindings.DeleteAll(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "delete page kv binding", "pageId", page.ID.Hex(), "error", err)
	}
	return nil
}

func (s *Service) DetachGroup(ctx context.Context, groupID bson.ObjectID) error {
	members, err := s.repository.Find(ctx, pagerepository.ListQuery{GroupID: &groupID})
	if err != nil {
		return fmt.Errorf("detach pages from group %s: %w", groupID.Hex(), err)
	}

	if err := s.repository.UnsetGroup(ctx, groupID); err != nil {
		return fmt.Errorf("detach pages from group %s: %w", groupID.Hex(), err)
	}

	actor := s.actor(ctx)
	now := time.Now()
	for _, member := range members {
		changes := []eventrepository.Change{{Field: "groupId", From: groupID.Hex(), To: nil}}
		s.history.Record(ctx, history.NewEvent(member.ID, historyservice.EventGroupDetached, actor, changes, now))
	}
	return nil
}

func (s *Service) Open(ctx context.Context, id bson.ObjectID, visit traffic.Visit) (*pagerepository.Page, error) {
	now := time.Now()
	isCounted := !visit.IsBot()
	page, err := s.repository.RegisterOpen(ctx, id, now, isCounted)
	if err != nil {
		return nil, fmt.Errorf("open page %s: %w", id.Hex(), err)
	}

	isExhausted, err := s.countOpen(ctx, page, visit, isCounted)
	if err != nil {
		s.logger.WarnContext(ctx, "count page unique visitor", "pageId", page.ID.Hex(), "error", err)
	}

	go s.recordOpen(context.WithoutCancel(ctx), *page, visit, now, isExhausted)
	return page, nil
}

func (s *Service) prepareInput(ctx context.Context, input Input) (*bson.ObjectID, error) {
	if err := input.CheckHTML(); err != nil {
		return nil, fmt.Errorf("check page html: %w", err)
	}

	if err := input.Rule().Check(); err != nil {
		return nil, fmt.Errorf("check page schedule: %w", err)
	}

	if input.GroupID == "" {
		return nil, nil
	}

	groupID, err := group.ParseID(input.GroupID)
	if err != nil {
		return nil, fmt.Errorf("parse page group id: %w", err)
	}

	if err := s.groups.Ensure(ctx, grouprepository.KindPages, groupID); err != nil {
		return nil, fmt.Errorf("resolve page group: %w", err)
	}
	return &groupID, nil
}

func (s *Service) reserveSlug(ctx context.Context, value string, targetID bson.ObjectID) (string, error) {
	if value == "" {
		reserved, err := s.slugs.ReserveRandom(ctx, slugrepository.KindPage, targetID)
		if err != nil {
			return "", fmt.Errorf("reserve page slug: %w", err)
		}
		return reserved, nil
	}

	if err := s.slugs.Reserve(ctx, value, slugrepository.KindPage, targetID); err != nil {
		return "", fmt.Errorf("reserve page slug: %w", err)
	}
	return value, nil
}

func (s *Service) countOpen(ctx context.Context, page *pagerepository.Page, visit traffic.Visit, isCounted bool) (bool, error) {
	rule := page.Rule()
	if !isCounted {
		return false, nil
	}
	if !rule.CountsVisitors() {
		return rule.ExhaustedBy(page.Clicks + 1), nil
	}

	isNew, err := s.uniques.Register(ctx, page.ID, visit)
	if err != nil || !isNew {
		return false, err
	}
	counted, err := s.repository.CountVisitor(ctx, page.ID)
	if err != nil {
		return false, fmt.Errorf("count page visitor %s: %w", page.ID.Hex(), err)
	}
	page.Visitors = counted.Visitors
	return rule.ExhaustedBy(counted.Visitors), nil
}

func (s *Service) recordOpen(ctx context.Context, page pagerepository.Page, visit traffic.Visit, at time.Time, isExhausted bool) {
	ctx, cancel := context.WithTimeout(ctx, recordTimeout)
	defer cancel()

	if err := s.opens.Record(ctx, page.ID, visit, at); err != nil {
		s.logger.WarnContext(ctx, "record page open", "pageId", page.ID.Hex(), "error", err)
	}

	if isExhausted {
		s.history.Record(ctx, history.NewEvent(page.ID, historyservice.EventExhausted, userrepository.SystemActor(), nil, at))
	}
}

func (s *Service) actor(ctx context.Context) userrepository.Actor {
	actor, err := s.actors.Actor(ctx)
	if err != nil {
		s.logger.WarnContext(ctx, "resolve page event actor", "error", err)
	}
	return actor
}

func restoredFrom(value *int, current int) *int {
	if value == nil || *value >= current {
		return nil
	}
	return value
}
