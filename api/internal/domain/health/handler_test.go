package health

import (
	"net/http/httptest"
	"encoding/json"
	"net/http"
	"testing"
)

func TestPing(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	rec := httptest.NewRecorder()

	Ping(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}

	var res PingResponse
	if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if res.Status != "success" || res.Message != "pong" {
		t.Errorf("unexpected response body: %+v", res)
	}
}
