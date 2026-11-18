package analytics

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/traffic"
)

type Repository interface {
	Insert(ctx context.Context, open *Open) error
	Find(ctx context.Context, pageID bson.ObjectID, from, to time.Time) ([]Open, error)
	FindBetween(ctx context.Context, from, to time.Time) ([]Open, error)
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type TargetFinder interface {
	Targets(ctx context.Context, ids []bson.ObjectID) ([]Target, error)
}

type Service struct {
	repository Repository
	visitors   *traffic.VisitorHasher
	logger     *slog.Logger
}

func NewService(repository Repository, logger *slog.Logger) *Service {
	return &Service{repository: repository, visitors: traffic.NewVisitorHasher(), logger: logger}
}

func (s *Service) Record(ctx context.Context, pageID bson.ObjectID, visit traffic.Visit, at time.Time) error {
	visitor, err := s.visitors.Hash(visit, at)
	if err != nil {
		s.logger.WarnContext(ctx, "hash page visitor", "pageId", pageID.Hex(), "error", err)
	}
	if err := s.repository.Insert(ctx, newOpen(pageID, visit, visitor, at)); err != nil {
		return fmt.Errorf("record page open %s: %w", pageID.Hex(), err)
	}
	return nil
}

func (s *Service) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if err := s.repository.DeleteAll(ctx, pageID); err != nil {
		return fmt.Errorf("delete page opens %s: %w", pageID.Hex(), err)
	}
	return nil
}

func (s *Service) Page(ctx context.Context, target Target, query traffic.AnalyticsQuery) (traffic.Analytics, error) {
	to := time.Now()
	from := target.CreatedAt
	span := query.Range.Duration()
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.repository.Find(ctx, target.ID, from, to)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("page analytics %s: %w", target.ID.Hex(), err)
	}
	analytics := traffic.Build(query, from, to, hitsOf(opens))
	if span == 0 {
		return analytics, nil
	}

	previous, err := s.repository.Find(ctx, target.ID, from.Add(-span), from)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("page analytics %s: %w", target.ID.Hex(), err)
	}
	clicks, visitors := traffic.Summarize(hitsOf(previous))
	analytics.Totals.PreviousClicks = &clicks
	analytics.Totals.PreviousVisitors = &visitors
	return analytics, nil
}

func (s *Service) Overview(ctx context.Context, query traffic.AnalyticsQuery, targets TargetFinder) (Overview, error) {
	to := time.Now()
	span := query.Range.Duration()
	from := to.Add(-traffic.Retention)
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.repository.FindBetween(ctx, from, to)
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
		previous, err := s.repository.FindBetween(ctx, from.Add(-span), from)
		if err != nil {
			return Overview{}, fmt.Errorf("pages overview: %w", err)
		}
		clicks, visitors := traffic.Summarize(hitsOf(previous))
		overview.Totals.PreviousClicks = &clicks
		overview.Totals.PreviousVisitors = &visitors
	}

	ranked := rank(opens)
	if len(ranked) == 0 {
		return overview, nil
	}

	ids := make([]bson.ObjectID, 0, len(ranked))
	for _, item := range ranked {
		ids = append(ids, item.ID)
	}
	found, err := targets.Targets(ctx, ids)
	if err != nil {
		return Overview{}, fmt.Errorf("pages overview: %w", err)
	}

	known := map[bson.ObjectID]Target{}
	for _, target := range found {
		known[target.ID] = target
	}
	for _, item := range ranked {
		target, ok := known[item.ID]
		if !ok {
			continue
		}
		item.Title = target.Title
		item.Slug = target.Slug
		overview.TopPages = append(overview.TopPages, item)
	}
	return overview, nil
}
