package integration

import (
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

type appConfig struct {
	Version                 int      `json:"version"`
	ProjectID               string   `json:"projectId"`
	Name                    string   `json:"name"`
	AllowedOrigins          []string `json:"allowedOrigins"`
	AllowNonBrowserRequests bool     `json:"allowNonBrowserRequests"`
	Roles                   []struct {
		Name string `json:"name"`
	} `json:"roles"`
	Tokens []struct {
		ID   string `json:"id"`
		Role string `json:"role"`
	} `json:"tokens"`
}

func appRole(name string, operations ...string) map[string]any {
	return map[string]any{"name": name, "rules": []map[string]any{{"collection": "notas", "operations": operations}}}
}

func TestAppConfigApply(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	app := env.CreateApp("Loja")
	env.CreateRole(app, "antigo", false, testenv.Rule{Collection: "*", Operations: []string{"read"}})
	readerToken := env.CreateToken(app, "antigo")
	exportPath := "/apps/" + app.ID + "/config/export"
	applyPath := "/apps/" + app.ID + "/config/apply"

	var initial appConfig
	exported := env.Admin(http.MethodGet, exportPath, nil)
	env.Expect(exported, http.StatusOK, "export app config")
	exported.Decode(t, &initial)
	if initial.Version != 1 || initial.ProjectID != app.ProjectID || len(initial.Roles) != 1 || len(initial.Tokens) != 2 {
		t.Fatalf("unexpected initial config: %+v", initial)
	}
	var readerID string
	for _, token := range initial.Tokens {
		if token.Role == "antigo" {
			readerID = token.ID
		}
	}

	t.Run("invalid configs change nothing", func(t *testing.T) {
		tests := []struct {
			name     string
			body     map[string]any
			wantCode int
			wantErr  string
		}{
			{name: "removing a role a token still uses", body: map[string]any{"name": "Mudou", "roles": []any{appRole("leitor", "read")}}, wantCode: http.StatusConflict, wantErr: "role_in_use"},
			{name: "token pointing to an unknown role", body: map[string]any{"tokens": []map[string]any{{"id": readerID, "role": "fantasma"}}}, wantCode: http.StatusNotFound, wantErr: "role_not_found"},
			{name: "unknown token", body: map[string]any{"tokens": []map[string]any{{"id": "nao-existe", "role": "admin"}}}, wantCode: http.StatusNotFound, wantErr: "token_not_found"},
			{name: "reserved role name", body: map[string]any{"roles": []any{appRole("admin", "read")}}, wantCode: http.StatusBadRequest, wantErr: "role_reserved"},
			{name: "empty name", body: map[string]any{"name": " "}, wantCode: http.StatusBadRequest, wantErr: "validation_failed"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				response := env.Admin(http.MethodPost, applyPath, tt.body)
				if response.Status != tt.wantCode || response.Code() != tt.wantErr {
					t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
				}
			})
		}

		var current appConfig
		env.Admin(http.MethodGet, exportPath, nil).Decode(t, &current)
		if current.Name != "Loja" || len(current.Roles) != 1 || current.Roles[0].Name != "antigo" {
			t.Fatalf("failed apply changed the app: %+v", current)
		}
	})

	t.Run("replaces roles and moves tokens in one apply", func(t *testing.T) {
		response := env.Admin(http.MethodPost, applyPath, map[string]any{
			"version":                 1,
			"name":                    "Loja nova",
			"allowedOrigins":          []string{"https://loja.test"},
			"allowNonBrowserRequests": true,
			"roles":                   []any{appRole("leitor", "read")},
			"tokens":                  []map[string]any{{"id": readerID, "role": "leitor"}},
		})
		env.Expect(response, http.StatusOK, "apply app config")
		var applied appConfig
		response.Decode(t, &applied)
		if applied.Name != "Loja nova" || len(applied.AllowedOrigins) != 1 || !applied.AllowNonBrowserRequests || len(applied.Roles) != 1 || applied.Roles[0].Name != "leitor" {
			t.Fatalf("config not applied: %+v", applied)
		}

		allowed := env.KV(readerToken, http.MethodGet, "/kv/notas/get-all", nil)
		env.Expect(allowed, http.StatusOK, "read with the moved token")
		denied := env.KV(readerToken, http.MethodGet, "/kv/outra/get-all", nil)
		if denied.Status != http.StatusForbidden {
			t.Fatalf("moved token reads outside its rules: %d %s", denied.Status, denied.Body)
		}
	})

	t.Run("unknown application answers not found", func(t *testing.T) {
		response := env.Admin(http.MethodGet, "/apps/6b05c4a7218f4195478fdbf0/config/export", nil)
		if response.Status != http.StatusNotFound {
			t.Fatalf("status %d, want 404: %s", response.Status, response.Body)
		}
	})
}
