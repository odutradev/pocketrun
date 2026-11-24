package unit

import (
	"testing"
	"time"

	"pocketrun-api/internal/services/traffic"
)

const browserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36"

func TestTrafficVisitIsBot(t *testing.T) {
	tests := []struct {
		name  string
		visit traffic.Visit
		want  bool
	}{
		{name: "browser is a person", visit: traffic.Visit{UserAgent: browserAgent}},
		{name: "empty agent is a bot", visit: traffic.Visit{}, want: true},
		{name: "head request is a bot", visit: traffic.Visit{UserAgent: browserAgent, IsProbe: true}, want: true},
		{name: "crawler is a bot", visit: traffic.Visit{UserAgent: "Googlebot/2.1"}, want: true},
		{name: "link preview is a bot", visit: traffic.Visit{UserAgent: "WhatsApp/2.23"}, want: true},
		{name: "curl is a bot", visit: traffic.Visit{UserAgent: "curl/8.4"}, want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.visit.IsBot(); got != tt.want {
				t.Errorf("IsBot() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTrafficSummarize(t *testing.T) {
	at := time.Date(2026, time.March, 10, 12, 0, 0, 0, time.UTC)
	person := traffic.Visit{UserAgent: browserAgent}
	bot := traffic.Visit{UserAgent: "Googlebot/2.1"}

	tests := []struct {
		name         string
		hits         []traffic.Hit
		wantClicks   int64
		wantVisitors int64
	}{
		{name: "counts nothing without hits"},
		{name: "repeated visitor counts once", hits: []traffic.Hit{traffic.NewHit(person, "a", at), traffic.NewHit(person, "a", at), traffic.NewHit(person, "b", at)}, wantClicks: 3, wantVisitors: 2},
		{name: "bots are ignored", hits: []traffic.Hit{traffic.NewHit(bot, "c", at), traffic.NewHit(person, "a", at)}, wantClicks: 1, wantVisitors: 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clicks, visitors := traffic.Summarize(tt.hits)
			if clicks != tt.wantClicks || visitors != tt.wantVisitors {
				t.Errorf("Summarize() = (%d, %d), want (%d, %d)", clicks, visitors, tt.wantClicks, tt.wantVisitors)
			}
		})
	}
}
