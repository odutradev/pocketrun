package page

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/group"
	"pocketrun-api/internal/platform/activation"
	"pocketrun-api/internal/platform/traffic"
	"pocketrun-api/internal/slug"
	"pocketrun-api/internal/user"
)

const recordTimeout = 5 * time.Second

type Repository interface {
	Find(ctx context.Context, query ListQuery) ([]Page, error)
	Count(ctx context.Context, query ListQuery) (int64, error)
	Totals(ctx context.Context) ([]GroupTotals, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*Page, error)
	FindByIDs(ctx context.Context, ids []bson.ObjectID) ([]Page, error)
	Insert(ctx context.Context, page *Page) error
	Replace(ctx context.Context, page *Page) error
	Delete(ctx context.Context, id bson.ObjectID) error
	UnsetGroup(ctx context.Context, groupID bson.ObjectID) error
	RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time, isCounted bool) (*Page, error)
}

type VersionRepository interface {
	InsertVersion(ctx context.Context, version *Version) error
	FindVersions(ctx context.Context, pageID bson.ObjectID) ([]Version, error)
	FindVersion(ctx context.Context, pageID bson.ObjectID, number int) (*Version, error)
	PruneVersions(ctx context.Context, pageID bson.ObjectID, keepFrom int) error
	DeleteVersions(ctx context.Context, pageID bson.ObjectID) error
}

type EventRepository interface {
	InsertEvent(ctx context.Context, event *Event) error
	FindEvents(ctx context.Context, pageID bson.ObjectID, query HistoryQuery) ([]Event, error)
	CountEvents(ctx context.Context, pageID bson.ObjectID) (int64, error)
}

type OpenRepository interface {
	InsertOpen(ctx context.Context, open *Open) error
	FindOpens(ctx context.Context, pageID bson.ObjectID, from, to time.Time) ([]Open, error)
	FindOpensBetween(ctx context.Context, from, to time.Time) ([]Open, error)
	DeleteOpens(ctx context.Context, pageID bson.ObjectID) error
}

type SlugRegistry interface {
	Check(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error)
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
	Versions   VersionRepository
	Events     EventRepository
	Opens      OpenRepository
	Slugs      SlugRegistry
	Groups     GroupChecker
	Actors     ActorFinder
	Logger     *slog.Logger
}

type Service struct {
	repository Repository
	versions   VersionRepository
	events     EventRepository
	opens      OpenRepository
	slugs      SlugRegistry
	groups     GroupChecker
	actors     ActorFinder
	visitors   *traffic.VisitorHasher
	logger     *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository: dependencies.Repository,
		versions:   dependencies.Versions,
		events:     dependencies.Events,
		opens:      dependencies.Opens,
		slugs:      dependencies.Slugs,
		groups:     dependencies.Groups,
		actors:     dependencies.Actors,
		visitors:   traffic.NewVisitorHasher(),
		logger:     dependencies.Logger,
	}
}

func (s *Service) List(ctx context.Context, query ListQuery) (ListPage, error) {
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

	summary := Summary{Groups: []GroupTotals{}}
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

func (s *Service) GetByID(ctx context.Context, id bson.ObjectID) (*Page, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get page %s: %w", id.Hex(), err)
	}
	page.State = page.StateAt(time.Now())
	return page, nil
}

func (s *Service) CheckSlug(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error) {
	availability, err := s.slugs.Check(ctx, value, ownerID)
	if err != nil {
		return slug.Availability{}, fmt.Errorf("check page slug: %w", err)
	}
	return availability, nil
}

func (s *Service) Create(ctx context.Context, managerID bson.ObjectID, input Input) (*Page, error) {
	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("create page: %w", err)
	}

	html := ""
	if input.HTML != nil {
		html = *input.HTML
	}

	now := time.Now()
	page := &Page{
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
	s.saveVersion(ctx, newVersion(page.ID, page.Version, page.HTML, input.Message, nil, actor, now))
	s.record(ctx, newEvent(page.ID, EventCreated, actor, snapshot(*page), now))
	page.State = page.StateAt(now)
	return page, nil
}

func (s *Service) Update(ctx context.Context, id bson.ObjectID, input Input) (*Page, error) {
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
		if err := s.slugs.Reserve(ctx, nextSlug, slug.KindPage, page.ID); err != nil {
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
		s.saveVersion(ctx, newVersion(page.ID, page.Version, page.HTML, input.Message, restoredFrom(input.RestoredFrom, page.Version), actor, page.UpdatedAt))
	}
	if changes := diff(previous, *page); len(changes) > 0 {
		s.record(ctx, newEvent(page.ID, EventUpdated, actor, changes, page.UpdatedAt))
	}
	page.State = page.StateAt(page.UpdatedAt)
	return page, nil
}

func (s *Service) SetStatus(ctx context.Context, id bson.ObjectID, isActive bool) (*Page, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("set page %s status: %w", id.Hex(), err)
	}

	previous := *page
	page.Mode = activation.ModeInactive
	if isActive {
		page.Mode = activation.ModeActive
	}
	page.StartsAt, page.EndsAt, page.MaxClicks = nil, nil, nil
	page.UpdatedAt = time.Now()

	changes := diff(previous, *page)
	if len(changes) == 0 {
		page.State = page.StateAt(page.UpdatedAt)
		return page, nil
	}

	if err := s.repository.Replace(ctx, page); err != nil {
		return nil, fmt.Errorf("set page %s status: %w", id.Hex(), err)
	}
	s.record(ctx, newEvent(page.ID, EventUpdated, s.actor(ctx), changes, page.UpdatedAt))
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

	s.record(ctx, newEvent(page.ID, EventDeleted, s.actor(ctx), nil, time.Now()))
	if err := s.opens.DeleteOpens(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "delete page opens", "pageId", page.ID.Hex(), "error", err)
	}
	if err := s.versions.DeleteVersions(ctx, page.ID); err != nil {
		s.logger.WarnContext(ctx, "delete page versions", "pageId", page.ID.Hex(), "error", err)
	}
	return nil
}

func (s *Service) DetachGroup(ctx context.Context, groupID bson.ObjectID) error {
	members, err := s.repository.Find(ctx, ListQuery{GroupID: &groupID})
	if err != nil {
		return fmt.Errorf("detach pages from group %s: %w", groupID.Hex(), err)
	}

	if err := s.repository.UnsetGroup(ctx, groupID); err != nil {
		return fmt.Errorf("detach pages from group %s: %w", groupID.Hex(), err)
	}

	actor := s.actor(ctx)
	now := time.Now()
	for _, member := range members {
		changes := []Change{{Field: "groupId", From: groupID.Hex(), To: nil}}
		s.record(ctx, newEvent(member.ID, EventGroupDetached, actor, changes, now))
	}
	return nil
}

func (s *Service) Versions(ctx context.Context, id bson.ObjectID) ([]Version, error) {
	if _, err := s.repository.FindByID(ctx, id); err != nil {
		return nil, fmt.Errorf("page versions %s: %w", id.Hex(), err)
	}

	versions, err := s.versions.FindVersions(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("page versions %s: %w", id.Hex(), err)
	}
	for index := range versions {
		versions[index].withLabel()
	}
	return versions, nil
}

func (s *Service) Version(ctx context.Context, id bson.ObjectID, number int) (*Version, error) {
	version, err := s.versions.FindVersion(ctx, id, number)
	if err != nil {
		return nil, fmt.Errorf("page version %s %d: %w", id.Hex(), number, err)
	}
	return version.withLabel(), nil
}

func (s *Service) History(ctx context.Context, id bson.ObjectID, query HistoryQuery) (HistoryPage, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil && !errors.Is(err, ErrPageNotFound) {
		return HistoryPage{}, fmt.Errorf("page history %s: %w", id.Hex(), err)
	}

	lookup := query
	lookup.Limit = query.Limit + 1
	events, err := s.events.FindEvents(ctx, id, lookup)
	if err != nil {
		return HistoryPage{}, fmt.Errorf("page history %s: %w", id.Hex(), err)
	}

	total, err := s.events.CountEvents(ctx, id)
	if err != nil {
		return HistoryPage{}, fmt.Errorf("page history %s: %w", id.Hex(), err)
	}

	now := time.Now()
	if expirationEvent(page, nil, now) != nil {
		total++
	}
	if expired := expirationEvent(page, query.Before, now); expired != nil {
		events = append(events, *expired)
		sort.SliceStable(events, func(i, j int) bool { return events[i].At.After(events[j].At) })
	}

	history := HistoryPage{Events: events, Total: total}
	if len(events) > query.Limit {
		history.Events = events[:query.Limit]
		cursor := history.Events[query.Limit-1].At
		history.NextCursor = &cursor
	}
	return history, nil
}

func (s *Service) Analytics(ctx context.Context, id bson.ObjectID, query traffic.AnalyticsQuery) (traffic.Analytics, error) {
	page, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("page analytics %s: %w", id.Hex(), err)
	}

	to := time.Now()
	from := page.CreatedAt
	span := query.Range.Duration()
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.opens.FindOpens(ctx, id, from, to)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("page analytics %s: %w", id.Hex(), err)
	}
	analytics := traffic.Build(query, from, to, hitsOf(opens))
	if span == 0 {
		return analytics, nil
	}

	previous, err := s.opens.FindOpens(ctx, id, from.Add(-span), from)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("page analytics %s: %w", id.Hex(), err)
	}
	clicks, visitors := traffic.Summarize(hitsOf(previous))
	analytics.Totals.PreviousClicks = &clicks
	analytics.Totals.PreviousVisitors = &visitors
	return analytics, nil
}

func (s *Service) Overview(ctx context.Context, query traffic.AnalyticsQuery) (Overview, error) {
	to := time.Now()
	span := query.Range.Duration()
	from := to.Add(-traffic.Retention)
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.opens.FindOpensBetween(ctx, from, to)
	if err != nil {
		return Overview{}, fmt.Errorf("pages overview: %w", err)
	}
	if span == 0 {
		from = to.Add(-7 * 24 * time.Hour)
		if len(opens) > 0 && opens[0].At.Before(from) {
			from = opens[0].At
		}
	}

	overview := Overview{Analytics: traffic.Build(query, from, to, hitsOf(opens)), TopPages: []RankedPage{}}
	if span > 0 {
		previous, err := s.opens.FindOpensBetween(ctx, from.Add(-span), from)
		if err != nil {
			return Overview{}, fmt.Errorf("pages overview: %w", err)
		}
		clicks, visitors := traffic.Summarize(hitsOf(previous))
		overview.Totals.PreviousClicks = &clicks
		overview.Totals.PreviousVisitors = &visitors
	}

	ranked := rankPages(opens)
	if len(ranked) == 0 {
		return overview, nil
	}

	ids := make([]bson.ObjectID, 0, len(ranked))
	for _, item := range ranked {
		ids = append(ids, item.ID)
	}
	pages, err := s.repository.FindByIDs(ctx, ids)
	if err != nil {
		return Overview{}, fmt.Errorf("pages overview: %w", err)
	}

	known := map[bson.ObjectID]Page{}
	for _, page := range pages {
		known[page.ID] = page
	}
	for _, item := range ranked {
		page, ok := known[item.ID]
		if !ok {
			continue
		}
		item.Title = page.Title
		item.Slug = page.Slug
		overview.TopPages = append(overview.TopPages, item)
	}
	return overview, nil
}

func (s *Service) Open(ctx context.Context, id bson.ObjectID, visit traffic.Visit) (*Page, error) {
	now := time.Now()
	isCounted := !visit.IsBot()
	page, err := s.repository.RegisterOpen(ctx, id, now, isCounted)
	if err != nil {
		return nil, fmt.Errorf("open page %s: %w", id.Hex(), err)
	}

	go s.recordOpen(context.WithoutCancel(ctx), *page, visit, now, isCounted)
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

	if err := s.groups.Ensure(ctx, group.KindPages, groupID); err != nil {
		return nil, fmt.Errorf("resolve page group: %w", err)
	}
	return &groupID, nil
}

func (s *Service) reserveSlug(ctx context.Context, value string, targetID bson.ObjectID) (string, error) {
	if value == "" {
		reserved, err := s.slugs.ReserveRandom(ctx, slug.KindPage, targetID)
		if err != nil {
			return "", fmt.Errorf("reserve page slug: %w", err)
		}
		return reserved, nil
	}

	if err := s.slugs.Reserve(ctx, value, slug.KindPage, targetID); err != nil {
		return "", fmt.Errorf("reserve page slug: %w", err)
	}
	return value, nil
}

func (s *Service) recordOpen(ctx context.Context, page Page, visit traffic.Visit, at time.Time, isCounted bool) {
	ctx, cancel := context.WithTimeout(ctx, recordTimeout)
	defer cancel()

	visitor, err := s.visitors.Hash(visit, at)
	if err != nil {
		s.logger.WarnContext(ctx, "hash page visitor", "pageId", page.ID.Hex(), "error", err)
	}
	if err := s.opens.InsertOpen(ctx, newOpen(page.ID, visit, visitor, at)); err != nil {
		s.logger.WarnContext(ctx, "record page open", "pageId", page.ID.Hex(), "error", err)
	}

	if isCounted && page.Rule().ExhaustedBy(page.Clicks+1) {
		s.record(ctx, newEvent(page.ID, EventExhausted, systemActor(), nil, at))
	}
}

func (s *Service) saveVersion(ctx context.Context, version *Version) {
	if err := s.versions.InsertVersion(ctx, version); err != nil {
		s.logger.WarnContext(ctx, "save page version", "pageId", version.PageID.Hex(), "number", version.Number, "error", err)
		return
	}
	if version.Number <= MaxVersions {
		return
	}
	if err := s.versions.PruneVersions(ctx, version.PageID, version.Number-MaxVersions+1); err != nil {
		s.logger.WarnContext(ctx, "prune page versions", "pageId", version.PageID.Hex(), "error", err)
	}
}

func (s *Service) record(ctx context.Context, event *Event) {
	if err := s.events.InsertEvent(ctx, event); err != nil {
		s.logger.WarnContext(ctx, "record page event", "pageId", event.PageID.Hex(), "type", event.Type, "error", err)
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
		s.logger.WarnContext(ctx, "resolve page event actor", "userId", claims.UserID, "error", err)
		return actor
	}
	actor.Name = member.Name
	actor.Email = member.Email
	return actor
}

func restoredFrom(value *int, current int) *int {
	if value == nil || *value >= current {
		return nil
	}
	return value
}

func expirationEvent(page *Page, before *time.Time, now time.Time) *Event {
	if page == nil || !page.Rule().ExpiredBefore(now) {
		return nil
	}
	if before != nil && !page.EndsAt.Before(*before) {
		return nil
	}

	event := newEvent(page.ID, EventExpired, systemActor(), nil, *page.EndsAt)
	event.ID = bson.NewObjectIDFromTimestamp(*page.EndsAt)
	return event
}
