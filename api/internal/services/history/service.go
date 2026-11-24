package history

import (
	"context"
	"fmt"
	"log/slog"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Repository interface {
	Insert(ctx context.Context, event *Event) error
	Find(ctx context.Context, targetID bson.ObjectID, query Query) ([]Event, error)
	Count(ctx context.Context, targetID bson.ObjectID) (int64, error)
}

type Service struct {
	repository Repository
	subject    string
	logger     *slog.Logger
}

func NewService(repository Repository, subject string, logger *slog.Logger) *Service {
	return &Service{repository: repository, subject: subject, logger: logger}
}

func (s *Service) Record(ctx context.Context, event *Event) {
	if err := s.repository.Insert(ctx, event); err != nil {
		s.logger.WarnContext(ctx, "record "+s.subject+" event", "targetId", event.TargetID.Hex(), "type", event.Type, "error", err)
	}
}

func (s *Service) List(ctx context.Context, targetID bson.ObjectID, query Query, expiredAt *time.Time) (Feed, error) {
	lookup := query
	lookup.Limit = query.Limit + 1
	events, err := s.repository.Find(ctx, targetID, lookup)
	if err != nil {
		return Feed{}, fmt.Errorf("%s history %s: %w", s.subject, targetID.Hex(), err)
	}

	total, err := s.repository.Count(ctx, targetID)
	if err != nil {
		return Feed{}, fmt.Errorf("%s history %s: %w", s.subject, targetID.Hex(), err)
	}

	if expiredAt != nil {
		total++
	}
	if expired := expirationEvent(targetID, expiredAt, query.Before); expired != nil {
		events = append(events, *expired)
		sort.SliceStable(events, func(i, j int) bool { return events[i].At.After(events[j].At) })
	}

	feed := Feed{Events: events, Total: total}
	if len(events) > query.Limit {
		feed.Events = events[:query.Limit]
		cursor := feed.Events[query.Limit-1].At
		feed.NextCursor = &cursor
	}
	return feed, nil
}
