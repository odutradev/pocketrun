package integration

import (
	"net/http"
	"testing"
	"time"

	"pocketrun-api/tests/testenv"
)

type kvShare struct {
	Name     string `json:"name"`
	Requests int64  `json:"requests"`
}

type kvAnalytics struct {
	Totals struct {
		Requests     int64 `json:"requests"`
		Failed       int64 `json:"failed"`
		Applications int64 `json:"applications"`
		Collections  int64 `json:"collections"`
	} `json:"totals"`
	Operations      []kvShare `json:"operations"`
	Collections     []kvShare `json:"collections"`
	TopApplications []struct {
		ID       string `json:"id"`
		Requests int64  `json:"requests"`
	} `json:"topApplications"`
}

func waitKVAnalytics(t *testing.T, env *testenv.Env, path string, requests int64) kvAnalytics {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for {
		response := env.Admin(http.MethodGet, path, nil)
		env.Expect(response, http.StatusOK, "kv analytics "+path)
		var analytics kvAnalytics
		response.Decode(t, &analytics)
		if analytics.Totals.Requests >= requests || time.Now().After(deadline) {
			return analytics
		}
		time.Sleep(50 * time.Millisecond)
	}
}

func shareOf(shares []kvShare, name string) int64 {
	for _, share := range shares {
		if share.Name == name {
			return share.Requests
		}
	}
	return 0
}

func TestKVAnalyticsCount(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	first := env.CreateApp("Primeira")
	second := env.CreateApp("Segunda")

	documentID(t, env.KV(first.Token, http.MethodPost, "/kv/notas/create", document("texto", "um")))
	env.Expect(env.KV(first.Token, http.MethodGet, "/kv/notas/get-all", nil), http.StatusOK, "list notes")
	env.Expect(env.KV(first.Token, http.MethodGet, "/kv/notas/get/invalido", nil), http.StatusBadRequest, "get invalid id")
	documentID(t, env.KV(second.Token, http.MethodPost, "/kv/tarefas/create", document("texto", "dois")))

	application := waitKVAnalytics(t, env, "/apps/"+first.ID+"/analytics/details?range=24h", 3)
	overview := waitKVAnalytics(t, env, "/apps/analytics/details?range=24h", 4)

	tests := []struct {
		name string
		got  int64
		want int64
	}{
		{name: "application counts only its own requests", got: application.Totals.Requests, want: 3},
		{name: "application counts failed requests", got: application.Totals.Failed, want: 1},
		{name: "application counts requests per collection", got: shareOf(application.Collections, "notas"), want: 3},
		{name: "application never shows another app's collection", got: shareOf(application.Collections, "tarefas"), want: 0},
		{name: "application counts requests per operation", got: shareOf(application.Operations, "get-all"), want: 1},
		{name: "overview sums every application", got: overview.Totals.Requests, want: 4},
		{name: "overview counts active applications", got: overview.Totals.Applications, want: 2},
		{name: "overview ranks applications", got: int64(len(overview.TopApplications)), want: 2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Fatalf("got %d, want %d", tt.got, tt.want)
			}
		})
	}

	t.Run("unknown application is not found", func(t *testing.T) {
		response := env.Admin(http.MethodGet, "/apps/000000000000000000000000/analytics/details", nil)
		if response.Status != http.StatusNotFound || response.Code() != "application_not_found" {
			t.Fatalf("status %d code %q: %s", response.Status, response.Code(), response.Body)
		}
	})
}
