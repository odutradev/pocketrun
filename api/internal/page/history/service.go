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
	Find(ctx context.Context, pageID bson.ObjectID, query Query) ([]Event, error)
	Count(ctx context.Context, pageID bson.ObjectID) (int64, error)
}

type Service struct {
	repository Repository
	logger     *slog.Logger
}

func NewService(repository Repository, logger *slog.Logger) *Service {
	return &Service{repository: repository, logger: logger}
}

func (s *Service) Record(ctx context.Context, event *Event) {
	if err := s.repository.Insert(ctx, event); err != nil {
		s.logger.WarnContext(ctx, "record page event", "pageId", event.PageID.Hex(), "type", event.Type, "error", err)
	}
}

func (s *Service) List(ctx context.Context, pageID bson.ObjectID, query Query, expiredAt *time.Time) (Feed, error) {
	lookup := query
	lookup.Limit = query.Limit + 1
	events, err := s.repository.Find(ctx, pageID, lookup)
	if err != nil {
		return Feed{}, fmt.Errorf("page history %s: %w", pageID.Hex(), err)
	}

	total, err := s.repository.Count(ctx, pageID)
	if err != nil {
		return Feed{}, fmt.Errorf("page history %s: %w", pageID.Hex(), err)
	}

	if expiredAt != nil {
		total++
	}
	if expired := expirationEvent(pageID, expiredAt, query.Before); expired != nil {
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
