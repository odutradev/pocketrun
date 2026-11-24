package integration

import (
	"net/http"
	"testing"
	"time"

	"pocketrun-api/tests/testenv"
)

const crawlerAgent = "Googlebot/2.1 (+http://www.google.com/bot.html)"

type visit struct {
	ip       string
	agent    string
	wantCode int
}

func TestLinkActivation(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	past := testenv.Later(-time.Hour)
	future := testenv.Later(time.Hour)

	tests := []struct {
		name      string
		input     map[string]any
		visits    []visit
		wantState string
		wantClick int64
	}{
		{
			name:      "active link redirects",
			input:     map[string]any{"mode": "active"},
			visits:    []visit{{ip: "10.0.0.1", wantCode: http.StatusFound}},
			wantState: "active",
			wantClick: 1,
		},
		{
			name:      "inactive link is not found",
			input:     map[string]any{"mode": "inactive"},
			visits:    []visit{{ip: "10.0.0.1", wantCode: http.StatusNotFound}},
			wantState: "inactive",
		},
		{
			name:      "scheduled period is not found",
			input:     map[string]any{"mode": "period", "startsAt": future, "endsAt": future.Add(time.Hour)},
			visits:    []visit{{ip: "10.0.0.1", wantCode: http.StatusNotFound}},
			wantState: "scheduled",
		},
		{
			name:      "running period redirects",
			input:     map[string]any{"mode": "period", "startsAt": past, "endsAt": future},
			visits:    []visit{{ip: "10.0.0.1", wantCode: http.StatusFound}},
			wantState: "active",
			wantClick: 1,
		},
		{
			name:      "ended period is not found",
			input:     map[string]any{"mode": "period", "startsAt": past.Add(-time.Hour), "endsAt": past},
			visits:    []visit{{ip: "10.0.0.1", wantCode: http.StatusNotFound}},
			wantState: "expired",
		},
		{
			name:  "click limit closes the link",
			input: map[string]any{"mode": "clicks", "maxClicks": 2, "countBy": "clicks"},
			visits: []visit{
				{ip: "10.0.0.1", wantCode: http.StatusFound},
				{ip: "10.0.0.1", wantCode: http.StatusFound},
				{ip: "10.0.0.2", wantCode: http.StatusNotFound},
			},
			wantState: "exhausted",
			wantClick: 2,
		},
		{
			name:  "bots do not spend clicks",
			input: map[string]any{"mode": "clicks", "maxClicks": 1, "countBy": "clicks"},
			visits: []visit{
				{ip: "10.0.0.9", agent: crawlerAgent, wantCode: http.StatusFound},
				{ip: "10.0.0.9", agent: crawlerAgent, wantCode: http.StatusFound},
				{ip: "10.0.0.1", wantCode: http.StatusFound},
				{ip: "10.0.0.2", wantCode: http.StatusNotFound},
			},
			wantState: "exhausted",
			wantClick: 1,
		},
		{
			name:  "visitor limit counts each visitor once",
			input: map[string]any{"mode": "clicks", "maxClicks": 2, "countBy": "visitors"},
			visits: []visit{
				{ip: "10.0.0.1", wantCode: http.StatusFound},
				{ip: "10.0.0.1", wantCode: http.StatusFound},
				{ip: "10.0.0.1", wantCode: http.StatusFound},
				{ip: "10.0.0.2", wantCode: http.StatusFound},
				{ip: "10.0.0.3", wantCode: http.StatusNotFound},
			},
			wantState: "exhausted",
			wantClick: 4,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := map[string]any{"title": "Teste", "url": "https://example.com/"}
			for key, value := range tt.input {
				input[key] = value
			}
			link := env.CreateLink(input)

			for index, v := range tt.visits {
				agent := v.agent
				if agent == "" {
					agent = testenv.BrowserAgent
				}
				if response := env.Visit(link.Slug, v.ip, agent); response.Status != v.wantCode {
					t.Fatalf("visit %d: status %d, want %d", index, response.Status, v.wantCode)
				}
			}

			response := env.Admin(http.MethodGet, "/links/"+link.ID+"/details", nil)
			env.Expect(response, http.StatusOK, "link details")
			var details struct {
				State  string `json:"state"`
				Clicks int64  `json:"clicks"`
			}
			response.Decode(t, &details)
			if details.State != tt.wantState || details.Clicks != tt.wantClick {
				t.Errorf("state %q clicks %d, want %q %d", details.State, details.Clicks, tt.wantState, tt.wantClick)
			}
		})
	}
}

func TestLinkScheduleValidation(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	future := testenv.Later(time.Hour)

	tests := []struct {
		name  string
		input map[string]any
	}{
		{name: "period without end", input: map[string]any{"mode": "period", "startsAt": future}},
		{name: "period ending before start", input: map[string]any{"mode": "period", "startsAt": future, "endsAt": future.Add(-time.Minute)}},
		{name: "clicks without limit", input: map[string]any{"mode": "clicks"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := map[string]any{"title": "Teste", "url": "https://example.com/", "slug": "v-" + testenv.RandomText(4)}
			for key, value := range tt.input {
				input[key] = value
			}
			response := env.Admin(http.MethodPost, "/links/create", input)
			if response.Status != http.StatusBadRequest || response.Code() != "invalid_schedule" {
				t.Fatalf("status %d code %q, want 400 invalid_schedule", response.Status, response.Code())
			}
		})
	}
}
