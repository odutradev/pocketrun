package analytics

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/services/traffic"
)

type Repository interface {
	Insert(ctx context.Context, open *Open) error
	Find(ctx context.Context, targetID bson.ObjectID, from, to time.Time) ([]Open, error)
	FindBetween(ctx context.Context, from, to time.Time) ([]Open, error)
	DeleteAll(ctx context.Context, targetID bson.ObjectID) error
}

type TargetFinder interface {
	Targets(ctx context.Context, ids []bson.ObjectID) ([]Target, error)
}

type Service struct {
	repository Repository
	visitors   *traffic.VisitorHasher
	subject    string
	logger     *slog.Logger
}

func NewService(repository Repository, subject string, logger *slog.Logger) *Service {
	return &Service{repository: repository, visitors: traffic.NewVisitorHasher(), subject: subject, logger: logger}
}

func (s *Service) Record(ctx context.Context, targetID bson.ObjectID, visit traffic.Visit, at time.Time) error {
	visitor, err := s.visitors.Hash(visit, at)
	if err != nil {
		s.logger.WarnContext(ctx, "hash "+s.subject+" visitor", "targetId", targetID.Hex(), "error", err)
	}
	if err := s.repository.Insert(ctx, newOpen(targetID, visit, visitor, at)); err != nil {
		return fmt.Errorf("record %s open %s: %w", s.subject, targetID.Hex(), err)
	}
	return nil
}

func (s *Service) DeleteAll(ctx context.Context, targetID bson.ObjectID) error {
	if err := s.repository.DeleteAll(ctx, targetID); err != nil {
		return fmt.Errorf("delete %s opens %s: %w", s.subject, targetID.Hex(), err)
	}
	return nil
}

func (s *Service) Target(ctx context.Context, target Target, query traffic.AnalyticsQuery) (traffic.Analytics, error) {
	to := time.Now()
	from := target.CreatedAt
	span := query.Range.Duration()
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.repository.Find(ctx, target.ID, from, to)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("%s analytics %s: %w", s.subject, target.ID.Hex(), err)
	}
	analytics := traffic.Build(query, from, to, hitsOf(opens))
	if span == 0 {
		return analytics, nil
	}

	previous, err := s.repository.Find(ctx, target.ID, from.Add(-span), from)
	if err != nil {
		return traffic.Analytics{}, fmt.Errorf("%s analytics %s: %w", s.subject, target.ID.Hex(), err)
	}
	clicks, visitors := traffic.Summarize(hitsOf(previous))
	analytics.Totals.PreviousClicks = &clicks
	analytics.Totals.PreviousVisitors = &visitors
	return analytics, nil
}

func (s *Service) Overview(ctx context.Context, query traffic.AnalyticsQuery, targets TargetFinder) (traffic.Analytics, []Ranked, error) {
	to := time.Now()
	span := query.Range.Duration()
	from := to.Add(-traffic.Retention)
	if span > 0 {
		from = to.Add(-span)
	}

	opens, err := s.repository.FindBetween(ctx, from, to)
	if err != nil {
		return traffic.Analytics{}, nil, fmt.Errorf("%ss overview: %w", s.subject, err)
	}
	if span == 0 {
		from = to.Add(-7 * 24 * time.Hour)
		if len(opens) > 0 && opens[0].At.Before(from) {
			from = opens[0].At
		}
	}

	analytics := traffic.Build(query, from, to, hitsOf(opens))
	if span > 0 {
		previous, err := s.repository.FindBetween(ctx, from.Add(-span), from)
		if err != nil {
			return traffic.Analytics{}, nil, fmt.Errorf("%ss overview: %w", s.subject, err)
		}
		clicks, visitors := traffic.Summarize(hitsOf(previous))
		analytics.Totals.PreviousClicks = &clicks
		analytics.Totals.PreviousVisitors = &visitors
	}

	top, err := s.named(ctx, rank(opens), targets)
	if err != nil {
		return traffic.Analytics{}, nil, fmt.Errorf("%ss overview: %w", s.subject, err)
	}
	return analytics, top, nil
}

func (s *Service) Moments(ctx context.Context, from, to time.Time) ([]time.Time, error) {
	opens, err := s.repository.FindBetween(ctx, from, to)
	if err != nil {
		return nil, fmt.Errorf("list open moments: %w", err)
	}
	moments := make([]time.Time, 0, len(opens))
	for _, open := range opens {
		if !open.IsBot {
			moments = append(moments, open.At)
		}
	}
	return moments, nil
}

func (s *Service) named(ctx context.Context, ranked []Ranked, targets TargetFinder) ([]Ranked, error) {
	named := []Ranked{}
	if len(ranked) == 0 {
		return named, nil
	}

	ids := make([]bson.ObjectID, 0, len(ranked))
	for _, item := range ranked {
		ids = append(ids, item.ID)
	}
	found, err := targets.Targets(ctx, ids)
	if err != nil {
		return nil, err
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
		named = append(named, item)
	}
	return named, nil
}
