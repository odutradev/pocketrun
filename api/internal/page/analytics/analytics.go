package analytics

import (
	"context"
	"fmt"
	"log/slog"

	analyticsservice "pocketrun-api/internal/services/analytics"
	"pocketrun-api/internal/services/traffic"
)

const MaxRanked = analyticsservice.MaxRanked

type (
	Target       = analyticsservice.Target
	TargetFinder = analyticsservice.TargetFinder
	RankedPage   = analyticsservice.Ranked
)

type Overview struct {
	traffic.Analytics
	TopPages []RankedPage `json:"topPages"`
}

type Service struct {
	*analyticsservice.Service
}

func NewService(repository analyticsservice.Repository, logger *slog.Logger) *Service {
	return &Service{Service: analyticsservice.NewService(repository, "page", logger)}
}

func (s *Service) Page(ctx context.Context, target Target, query traffic.AnalyticsQuery) (traffic.Analytics, error) {
	return s.Target(ctx, target, query)
}

func (s *Service) Overview(ctx context.Context, query traffic.AnalyticsQuery, targets TargetFinder) (Overview, error) {
	analytics, top, err := s.Service.Overview(ctx, query, targets)
	if err != nil {
		return Overview{}, fmt.Errorf("page analytics overview: %w", err)
	}
	return Overview{Analytics: analytics, TopPages: top}, nil
}
