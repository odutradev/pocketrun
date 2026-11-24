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
	RankedLink   = analyticsservice.Ranked
)

type Overview struct {
	traffic.Analytics
	TopLinks []RankedLink `json:"topLinks"`
}

type Service struct {
	*analyticsservice.Service
}

func NewService(repository analyticsservice.Repository, logger *slog.Logger) *Service {
	return &Service{Service: analyticsservice.NewService(repository, "link", logger)}
}

func (s *Service) Link(ctx context.Context, target Target, query traffic.AnalyticsQuery) (traffic.Analytics, error) {
	return s.Target(ctx, target, query)
}

func (s *Service) Overview(ctx context.Context, query traffic.AnalyticsQuery, targets TargetFinder) (Overview, error) {
	analytics, top, err := s.Service.Overview(ctx, query, targets)
	if err != nil {
		return Overview{}, fmt.Errorf("link analytics overview: %w", err)
	}
	return Overview{Analytics: analytics, TopLinks: top}, nil
}
