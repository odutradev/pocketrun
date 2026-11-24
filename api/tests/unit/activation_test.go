package unit

import (
	"errors"
	"testing"
	"time"

	"pocketrun-api/internal/services/activation"
)

func TestActivationRuleCheck(t *testing.T) {
	now := time.Date(2026, time.March, 10, 12, 0, 0, 0, time.UTC)
	later := now.Add(time.Hour)
	limit := int64(10)

	tests := []struct {
		name string
		rule activation.Rule
		want error
	}{
		{name: "accepts active mode", rule: activation.Rule{Mode: activation.ModeActive}},
		{name: "accepts inactive mode", rule: activation.Rule{Mode: activation.ModeInactive}},
		{name: "rejects period without end", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &now}, want: activation.ErrInvalidSchedule},
		{name: "rejects period ending before start", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &later, EndsAt: &now}, want: activation.ErrInvalidSchedule},
		{name: "rejects period starting at the end", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &now, EndsAt: &now}, want: activation.ErrInvalidSchedule},
		{name: "accepts period with end only", rule: activation.Rule{Mode: activation.ModePeriod, EndsAt: &later}},
		{name: "accepts period with start and end", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &now, EndsAt: &later}},
		{name: "rejects clicks without limit", rule: activation.Rule{Mode: activation.ModeClicks}, want: activation.ErrInvalidSchedule},
		{name: "accepts clicks with limit", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := tt.rule.Check(); !errors.Is(err, tt.want) {
				t.Errorf("Check() = %v, want %v", err, tt.want)
			}
		})
	}
}

func TestActivationRuleNormalize(t *testing.T) {
	now := time.Date(2026, time.March, 10, 12, 0, 0, 0, time.UTC)
	limit := int64(5)

	tests := []struct {
		name          string
		rule          activation.Rule
		wantPeriod    bool
		wantMaxClicks bool
		wantCountBy   activation.CountBy
	}{
		{name: "clears period and clicks in active mode", rule: activation.Rule{Mode: activation.ModeActive, StartsAt: &now, EndsAt: &now, MaxClicks: &limit, CountBy: activation.CountVisitors}},
		{name: "keeps period and clears clicks in period mode", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &now, EndsAt: &now, MaxClicks: &limit, CountBy: activation.CountVisitors}, wantPeriod: true},
		{name: "keeps visitors count in clicks mode", rule: activation.Rule{Mode: activation.ModeClicks, StartsAt: &now, EndsAt: &now, MaxClicks: &limit, CountBy: activation.CountVisitors}, wantMaxClicks: true, wantCountBy: activation.CountVisitors},
		{name: "defaults to clicks count in clicks mode", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit, CountBy: "other"}, wantMaxClicks: true, wantCountBy: activation.CountClicks},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rule := tt.rule
			rule.Normalize()
			if hasPeriod := rule.StartsAt != nil || rule.EndsAt != nil; hasPeriod != tt.wantPeriod {
				t.Errorf("period kept = %v, want %v", hasPeriod, tt.wantPeriod)
			}
			if hasMaxClicks := rule.MaxClicks != nil; hasMaxClicks != tt.wantMaxClicks {
				t.Errorf("max clicks kept = %v, want %v", hasMaxClicks, tt.wantMaxClicks)
			}
			if rule.CountBy != tt.wantCountBy {
				t.Errorf("CountBy = %q, want %q", rule.CountBy, tt.wantCountBy)
			}
		})
	}
}

func TestActivationRuleStateAt(t *testing.T) {
	now := time.Date(2026, time.March, 10, 12, 0, 0, 0, time.UTC)
	before := now.Add(-time.Hour)
	after := now.Add(time.Hour)
	limit := int64(3)

	tests := []struct {
		name   string
		rule   activation.Rule
		counts activation.Counts
		want   activation.State
	}{
		{name: "active mode is active", rule: activation.Rule{Mode: activation.ModeActive}, want: activation.StateActive},
		{name: "inactive mode is inactive", rule: activation.Rule{Mode: activation.ModeInactive}, want: activation.StateInactive},
		{name: "period before start is scheduled", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &after, EndsAt: &after}, want: activation.StateScheduled},
		{name: "period inside window is active", rule: activation.Rule{Mode: activation.ModePeriod, StartsAt: &before, EndsAt: &after}, want: activation.StateActive},
		{name: "period at the end is expired", rule: activation.Rule{Mode: activation.ModePeriod, EndsAt: &now}, want: activation.StateExpired},
		{name: "period after the end is expired", rule: activation.Rule{Mode: activation.ModePeriod, EndsAt: &before}, want: activation.StateExpired},
		{name: "clicks below limit is active", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit, CountBy: activation.CountClicks}, counts: activation.Counts{Clicks: 2}, want: activation.StateActive},
		{name: "clicks at limit is exhausted", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit, CountBy: activation.CountClicks}, counts: activation.Counts{Clicks: 3}, want: activation.StateExhausted},
		{name: "visitors count ignores clicks", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit, CountBy: activation.CountVisitors}, counts: activation.Counts{Clicks: 10, Visitors: 2}, want: activation.StateActive},
		{name: "visitors at limit is exhausted", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit, CountBy: activation.CountVisitors}, counts: activation.Counts{Clicks: 3, Visitors: 3}, want: activation.StateExhausted},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.rule.StateAt(tt.counts, now); got != tt.want {
				t.Errorf("StateAt() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestActivationRuleExhaustedBy(t *testing.T) {
	limit := int64(3)

	tests := []struct {
		name  string
		rule  activation.Rule
		count int64
		want  bool
	}{
		{name: "not exhausted below limit", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit}, count: 2},
		{name: "exhausted exactly at limit", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit}, count: 3, want: true},
		{name: "not reported again past limit", rule: activation.Rule{Mode: activation.ModeClicks, MaxClicks: &limit}, count: 4},
		{name: "never exhausted outside clicks mode", rule: activation.Rule{Mode: activation.ModeActive, MaxClicks: &limit}, count: 3},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.rule.ExhaustedBy(tt.count); got != tt.want {
				t.Errorf("ExhaustedBy(%d) = %v, want %v", tt.count, got, tt.want)
			}
		})
	}
}
