package integration

import (
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

const visitorDataLimit = 120

func TestPageBridgeAccess(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	page := env.CreatePage(map[string]any{"title": "Página", "html": "<h1>oi</h1>"})

	response := env.PageData(page.Slug, http.MethodGet, "notas/get-all", nil, "10.0.1.1")
	if response.Status != http.StatusNotFound || response.Code() != "kv_not_linked" {
		t.Fatalf("before enabling: status %d code %q, want 404 kv_not_linked", response.Status, response.Code())
	}
	env.Expect(env.Admin(http.MethodPost, "/pages/"+page.ID+"/kv/enable", nil), http.StatusOK, "enable page kv")

	tests := []struct {
		name     string
		method   string
		path     string
		body     any
		headers  map[string]string
		wantCode int
		wantErr  string
	}{
		{name: "public role reads", method: http.MethodGet, path: "notas/get-all", wantCode: http.StatusOK},
		{name: "public role cannot create", method: http.MethodPost, path: "notas/create", body: document("texto", "oi"), wantCode: http.StatusForbidden, wantErr: "forbidden_operation"},
		{name: "public role cannot delete", method: http.MethodDelete, path: "notas/delete/6b05c4a7218f4195478fdbf0", wantCode: http.StatusForbidden, wantErr: "forbidden_operation"},
		{name: "collection clearing is not exposed", method: http.MethodDelete, path: "notas/delete-all", wantCode: http.StatusNotFound, wantErr: "route_not_found"},
		{name: "call without page header is refused", method: http.MethodGet, path: "notas/get-all", headers: map[string]string{testenv.PageDataHeader: ""}, wantCode: http.StatusForbidden, wantErr: "invalid_client"},
		{name: "cross site call is refused", method: http.MethodGet, path: "notas/get-all", headers: map[string]string{"Sec-Fetch-Site": "cross-site"}, wantCode: http.StatusForbidden, wantErr: "invalid_client"},
		{name: "call from another origin is refused", method: http.MethodGet, path: "notas/get-all", headers: map[string]string{"Origin": "https://evil.test"}, wantCode: http.StatusForbidden, wantErr: "invalid_client"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			headers := map[string]string{testenv.PageDataHeader: "1", testenv.ClientIPHeader: "10.0.1.2"}
			for name, value := range tt.headers {
				headers[name] = value
			}
			response := env.Do(testenv.Request{Method: tt.method, Path: "/" + page.Slug + "/_/kv/" + tt.path, Body: tt.body, Headers: headers})
			if response.Status != tt.wantCode || response.Code() != tt.wantErr {
				t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
			}
		})
	}

	t.Run("page without public role denies visitors", func(t *testing.T) {
		env.Expect(env.Admin(http.MethodPatch, "/pages/"+page.ID+"/kv/set", map[string]any{"publicRole": "", "roles": []any{}}), http.StatusOK, "remove public role")
		response := env.PageData(page.Slug, http.MethodGet, "notas/get-all", nil, "10.0.1.3")
		if response.Status != http.StatusForbidden || response.Code() != "kv_access_denied" {
			t.Fatalf("status %d code %q, want 403 kv_access_denied", response.Status, response.Code())
		}
	})
}

func TestPageBridgeRateLimit(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	page := env.CreatePage(map[string]any{"title": "Página", "html": "<h1>oi</h1>"})
	env.Expect(env.Admin(http.MethodPost, "/pages/"+page.ID+"/kv/enable", nil), http.StatusOK, "enable page kv")

	for index := range visitorDataLimit {
		if response := env.PageData(page.Slug, http.MethodGet, "notas/count", nil, "10.0.2.1"); response.Status != http.StatusOK {
			t.Fatalf("request %d: status %d: %s", index, response.Status, response.Body)
		}
	}

	tests := []struct {
		name      string
		ip        string
		wantCode  int
		wantRetry string
	}{
		{name: "same visitor is limited", ip: "10.0.2.1", wantCode: http.StatusTooManyRequests, wantRetry: "60"},
		{name: "another visitor still passes", ip: "10.0.2.2", wantCode: http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := env.PageData(page.Slug, http.MethodGet, "notas/count", nil, tt.ip)
			if response.Status != tt.wantCode || response.Header.Get("Retry-After") != tt.wantRetry {
				t.Fatalf("status %d retry %q, want %d %q", response.Status, response.Header.Get("Retry-After"), tt.wantCode, tt.wantRetry)
			}
		})
	}
}
