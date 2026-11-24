package integration

import (
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

func TestApplicationIsolation(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	first := env.CreateApp("Primeira")
	second := env.CreateApp("Segunda")
	secret := documentID(t, env.KV(first.Token, http.MethodPost, "/kv/notas/create", document("texto", "segredo")))
	documentID(t, env.KV(second.Token, http.MethodPost, "/kv/notas/create", document("texto", "público")))

	tests := []struct {
		name     string
		method   string
		path     string
		body     any
		wantCode int
		wantErr  string
	}{
		{name: "cannot read another app's document", method: http.MethodGet, path: "/kv/notas/get/" + secret, wantCode: http.StatusNotFound, wantErr: "document_not_found"},
		{name: "cannot update another app's document", method: http.MethodPatch, path: "/kv/notas/update/" + secret, body: document("texto", "invadido"), wantCode: http.StatusNotFound, wantErr: "document_not_found"},
		{name: "cannot replace another app's document", method: http.MethodPut, path: "/kv/notas/replace/" + secret, body: document("texto", "invadido"), wantCode: http.StatusNotFound, wantErr: "document_not_found"},
		{name: "cannot delete another app's document", method: http.MethodDelete, path: "/kv/notas/delete/" + secret, wantCode: http.StatusNotFound, wantErr: "document_not_found"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := env.KV(second.Token, tt.method, tt.path, tt.body)
			if response.Status != tt.wantCode || response.Code() != tt.wantErr {
				t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
			}
		})
	}

	readers := []struct {
		name   string
		method string
		path   string
		body   any
	}{
		{name: "list shows only own documents", method: http.MethodGet, path: "/kv/notas/get-all"},
		{name: "filter on appId cannot widen the list", method: http.MethodGet, path: "/kv/notas/get-all?appId=" + first.ID},
		{name: "filter on creator role cannot widen the list", method: http.MethodGet, path: "/kv/notas/get-all?createdByRole=admin&appId__exists=true"},
		{name: "collection export shows only own documents", method: http.MethodGet, path: "/kv/notas/export"},
		{name: "project export shows only own documents", method: http.MethodGet, path: "/kv/project/export"},
		{name: "eval filters cannot reach another app", method: http.MethodPost, path: "/kv/notas/eval", body: map[string]any{"operation": "distinct", "field": "texto", "filters": map[string]any{"appId": first.ID}}},
	}

	for _, tt := range readers {
		t.Run(tt.name, func(t *testing.T) {
			response := env.KV(second.Token, tt.method, tt.path, tt.body)
			if response.Status != http.StatusOK {
				t.Fatalf("status %d: %s", response.Status, response.Body)
			}
			if response.Contains("segredo") || response.Contains(secret) || response.Contains(first.ID) {
				t.Fatalf("response leaks the first app's data: %s", response.Body)
			}
		})
	}

	t.Run("count ignores another app's documents", func(t *testing.T) {
		if count := countDocuments(t, env, second.Token, "notas"); count != 1 {
			t.Fatalf("second app counts %d notes, want 1", count)
		}
	})

	t.Run("token reports its own project", func(t *testing.T) {
		response := env.KV(second.Token, http.MethodGet, "/validate/control-access", nil)
		env.Expect(response, http.StatusOK, "validate token")
		var validation struct {
			ProjectID string `json:"projectId"`
		}
		response.Decode(t, &validation)
		if validation.ProjectID != second.ProjectID {
			t.Fatalf("projectId %q, want %q", validation.ProjectID, second.ProjectID)
		}
	})

	t.Run("project import and clearing stay inside the app", func(t *testing.T) {
		env.Expect(env.KV(second.Token, http.MethodPost, "/kv/project/import", map[string]any{"data": map[string]any{"notas": []map[string]any{{"texto": "importado"}}}}), http.StatusCreated, "import project")
		env.Expect(env.KV(second.Token, http.MethodDelete, "/kv/project/delete-all", nil), http.StatusOK, "clear project")
		env.Expect(env.KV(second.Token, http.MethodDelete, "/kv/notas/delete-all", nil), http.StatusOK, "clear collection")

		documents := listDocuments(t, env, first.Token, "/kv/notas/get-all")
		if len(documents) != 1 || documents[0].ID != secret || documents[0].Data["texto"] != "segredo" {
			t.Fatalf("first app documents changed: %+v", documents)
		}
	})

	t.Run("deleting an app keeps the other app's data", func(t *testing.T) {
		env.Expect(env.Admin(http.MethodDelete, "/apps/"+second.ID+"/delete", nil), http.StatusOK, "delete second app")
		response := env.KV(second.Token, http.MethodGet, "/kv/notas/get-all", nil)
		if response.Status != http.StatusUnauthorized || response.Code() != "invalid_access_token" {
			t.Fatalf("deleted app token: status %d code %q, want 401 invalid_access_token", response.Status, response.Code())
		}
		if count := countDocuments(t, env, first.Token, "notas"); count != 1 {
			t.Fatalf("first app counts %d notes, want 1", count)
		}
	})
}

func TestApplicationTokenCannotReachPanel(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	app := env.CreateApp("Primeira")
	env.CreateLink(map[string]any{"title": "Link", "url": "https://example.com/"})
	env.CreatePage(map[string]any{"title": "Página", "html": "<h1>oi</h1>"})

	paths := []string{"/admin/apps/list", "/admin/apps/" + app.ID + "/details", "/admin/links/list", "/admin/pages/list", "/admin/auth/me/details"}

	for _, path := range paths {
		t.Run(path, func(t *testing.T) {
			response := env.Do(testenv.Request{Method: http.MethodGet, Path: path, Headers: map[string]string{
				testenv.PanelHeader: testenv.PanelClient,
				"Authorization":     "Bearer " + app.Token,
			}})
			if response.Status != http.StatusUnauthorized {
				t.Fatalf("status %d, want 401: %s", response.Status, response.Body)
			}
		})
	}
}

func TestPageDataIsolation(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	app := env.CreateApp("Primeira")
	secret := documentID(t, env.KV(app.Token, http.MethodPost, "/kv/notas/create", document("texto", "segredo")))
	page := env.CreatePage(map[string]any{"title": "Página", "html": "<h1>oi</h1>"})
	env.Expect(env.Admin(http.MethodPost, "/pages/"+page.ID+"/kv/enable", nil), http.StatusOK, "enable page kv")
	env.Expect(env.Admin(http.MethodPatch, "/pages/"+page.ID+"/kv/set", map[string]any{"publicRole": "gestao", "roles": []any{}}), http.StatusOK, "set public role")
	pageNote := documentID(t, env.PageData(page.Slug, http.MethodPost, "notas/create", document("texto", "da página"), "10.0.4.1"))

	tests := []struct {
		name     string
		method   string
		path     string
		body     any
		wantCode int
	}{
		{name: "page cannot read the app's document", method: http.MethodGet, path: "notas/get/" + secret, wantCode: http.StatusNotFound},
		{name: "page cannot update the app's document", method: http.MethodPatch, path: "notas/update/" + secret, body: document("texto", "invadido"), wantCode: http.StatusNotFound},
		{name: "page cannot delete the app's document", method: http.MethodDelete, path: "notas/delete/" + secret, wantCode: http.StatusNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := env.PageData(page.Slug, tt.method, tt.path, tt.body, "10.0.4.1")
			if response.Status != tt.wantCode {
				t.Fatalf("status %d, want %d: %s", response.Status, tt.wantCode, response.Body)
			}
		})
	}

	t.Run("page list shows only page documents", func(t *testing.T) {
		response := env.PageData(page.Slug, http.MethodGet, "notas/get-all", nil, "10.0.4.1")
		env.Expect(response, http.StatusOK, "page list")
		if response.Contains("segredo") || !response.Contains(pageNote) {
			t.Fatalf("page list mixes apps: %s", response.Body)
		}
	})

	t.Run("app token cannot read page documents", func(t *testing.T) {
		response := env.KV(app.Token, http.MethodGet, "/kv/notas/get/"+pageNote, nil)
		if response.Status != http.StatusNotFound {
			t.Fatalf("status %d, want 404: %s", response.Status, response.Body)
		}
		documents := listDocuments(t, env, app.Token, "/kv/notas/get-all")
		if len(documents) != 1 || documents[0].ID != secret {
			t.Fatalf("app list mixes page data: %+v", documents)
		}
	})
}
