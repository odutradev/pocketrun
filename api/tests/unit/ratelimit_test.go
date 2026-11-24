package unit

import (
	"testing"
	"time"

	"pocketrun-api/internal/services/ratelimit"
)

func TestRateLimitLimiterAllow(t *testing.T) {
	start := time.Date(2026, time.March, 10, 12, 0, 0, 0, time.UTC)

	type call struct {
		key    string
		offset time.Duration
		want   bool
	}

	tests := []struct {
		name  string
		calls []call
	}{
		{name: "allows up to the limit", calls: []call{{"a", 0, true}, {"a", time.Second, true}, {"a", 2 * time.Second, true}}},
		{name: "blocks past the limit", calls: []call{{"a", 0, true}, {"a", 0, true}, {"a", 0, true}, {"a", 0, false}}},
		{name: "opens a new window after the duration", calls: []call{{"a", 0, true}, {"a", 0, true}, {"a", 0, true}, {"a", 0, false}, {"a", time.Minute, true}}},
		{name: "counts each key apart", calls: []call{{"a", 0, true}, {"a", 0, true}, {"a", 0, true}, {"b", 0, true}}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			limiter := ratelimit.New(time.Minute, 3)
			for index, c := range tt.calls {
				if got := limiter.Allow(c.key, start.Add(c.offset)); got != c.want {
					t.Errorf("call %d: Allow(%q) = %v, want %v", index, c.key, got, c.want)
				}
			}
		})
	}
}
