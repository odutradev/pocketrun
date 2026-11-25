package integration

import (
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

const (
	configGeneralPIN = "604918"
	configOtherPIN   = "517302"
)

type pageConfig struct {
	Version int `json:"version"`
	Access  struct {
		IsEnabled    bool `json:"isEnabled"`
		SessionHours int  `json:"sessionHours"`
		PINs         []struct {
			Role   string `json:"role"`
			KVRole string `json:"kvRole"`
		} `json:"pins"`
	} `json:"access"`
	KV struct {
		IsEnabled  bool   `json:"isEnabled"`
		PublicRole string `json:"publicRole"`
		Roles      []struct {
			Name string `json:"name"`
		} `json:"roles"`
	} `json:"kv"`
}

type appliedConfig struct {
	Config pageConfig `json:"config"`
	Issued []struct {
		Role string `json:"role"`
		PIN  string `json:"pin"`
	} `json:"issued"`
}

func configRoles(names ...string) []map[string]any {
	operations := map[string][]string{
		"leitor": {"read"},
		"equipe": {"read", "create", "update", "delete"},
	}
	list := []map[string]any{}
	for _, name := range names {
		list = append(list, map[string]any{"name": name, "rules": []map[string]any{{"collection": "*", "operations": operations[name]}}})
	}
	return list
}

func pinKVRole(config pageConfig, role string) (string, bool) {
	for _, pin := range config.Access.PINs {
		if pin.Role == role {
			return pin.KVRole, true
		}
	}
	return "", false
}

func TestPageConfigApply(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	page := env.CreatePage(map[string]any{"title": "Página", "html": "<h1>painel</h1>"})
	exportPath := "/pages/" + page.ID + "/config/export"
	applyPath := "/pages/" + page.ID + "/config/apply"

	var initial pageConfig
	exported := env.Admin(http.MethodGet, exportPath, nil)
	env.Expect(exported, http.StatusOK, "export initial config")
	exported.Decode(t, &initial)
	if initial.Version != 1 || initial.Access.IsEnabled || initial.KV.IsEnabled || len(initial.KV.Roles) != 3 {
		t.Fatalf("unexpected initial config: %+v", initial)
	}

	applied := env.Admin(http.MethodPost, applyPath, map[string]any{
		"version": 1,
		"access": map[string]any{
			"isEnabled":    true,
			"sessionHours": 48,
			"pins": []map[string]any{
				{"role": "", "pin": configGeneralPIN, "kvRole": "leitor"},
				{"role": "Equipe", "kvRole": "equipe"},
			},
		},
		"kv": map[string]any{"isEnabled": true, "publicRole": "", "roles": configRoles("leitor", "equipe")},
	})
	env.Expect(applied, http.StatusOK, "apply config")
	var result appliedConfig
	applied.Decode(t, &result)

	if len(result.Issued) != 1 || result.Issued[0].Role != "equipe" || len(result.Issued[0].PIN) != 6 {
		t.Fatalf("expected one generated pin for equipe: %+v", result.Issued)
	}
	if !result.Config.Access.IsEnabled || result.Config.Access.SessionHours != 48 || !result.Config.KV.IsEnabled || len(result.Config.KV.Roles) != 2 {
		t.Fatalf("config not applied: %+v", result.Config)
	}
	if role, _ := pinKVRole(result.Config, "equipe"); role != "equipe" {
		t.Fatalf("equipe pin mapped to %q", role)
	}

	t.Run("each pin writes with its own role", func(t *testing.T) {
		tests := []struct {
			name     string
			pin      string
			ip       string
			wantCode int
		}{
			{name: "general pin only reads", pin: configGeneralPIN, ip: "10.0.3.1", wantCode: http.StatusForbidden},
			{name: "team pin creates", pin: result.Issued[0].PIN, ip: "10.0.3.2", wantCode: http.StatusCreated},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				unlocked := env.UnlockPage(page.Slug, tt.pin, tt.ip)
				env.Expect(unlocked, http.StatusSeeOther, "unlock page")
				session := pageCookie(t, unlocked.Header)
				response := env.Do(testenv.Request{
					Method:  http.MethodPost,
					Path:    "/" + page.Slug + "/_/kv/notas/create",
					Body:    document("texto", "oi"),
					Headers: map[string]string{testenv.PageDataHeader: "1", testenv.ClientIPHeader: tt.ip, "Cookie": session.Name + "=" + session.Value},
				})
				if response.Status != tt.wantCode {
					t.Fatalf("status %d, want %d: %s", response.Status, tt.wantCode, response.Body)
				}
			})
		}
	})

	t.Run("invalid configs change nothing", func(t *testing.T) {
		tests := []struct {
			name     string
			body     map[string]any
			wantCode int
			wantErr  string
		}{
			{name: "unknown kv role", body: map[string]any{"access": map[string]any{"pins": []map[string]any{{"role": "", "kvRole": "fantasma"}}}}, wantCode: http.StatusBadRequest, wantErr: "role_not_found"},
			{name: "repeated pin", body: map[string]any{"access": map[string]any{"pins": []map[string]any{{"role": "", "pin": configOtherPIN}, {"role": "outra", "pin": configOtherPIN}}}}, wantCode: http.StatusConflict, wantErr: "pin_in_use"},
			{name: "weak pin", body: map[string]any{"access": map[string]any{"pins": []map[string]any{{"role": "", "pin": "123456"}}}}, wantCode: http.StatusBadRequest, wantErr: "weak_pin"},
			{name: "protection without pins", body: map[string]any{"access": map[string]any{"isEnabled": true, "pins": []map[string]any{}}}, wantCode: http.StatusBadRequest, wantErr: "no_access_keys"},
			{name: "reserved role name", body: map[string]any{"kv": map[string]any{"roles": []map[string]any{{"name": "admin", "rules": []map[string]any{{"collection": "*", "operations": []string{"read"}}}}}}}, wantCode: http.StatusBadRequest, wantErr: "role_reserved"},
			{name: "unknown version", body: map[string]any{"version": 2}, wantCode: http.StatusBadRequest, wantErr: "validation_failed"},
		}
		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				response := env.Admin(http.MethodPost, applyPath, tt.body)
				if response.Status != tt.wantCode || response.Code() != tt.wantErr {
					t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
				}
			})
		}

		var current pageConfig
		env.Admin(http.MethodGet, exportPath, nil).Decode(t, &current)
		if len(current.Access.PINs) != 2 || len(current.KV.Roles) != 2 {
			t.Fatalf("failed apply changed the config: %+v", current)
		}
	})

	t.Run("removing a role clears the pins that used it", func(t *testing.T) {
		response := env.Admin(http.MethodPost, applyPath, map[string]any{"kv": map[string]any{"roles": configRoles("leitor")}})
		env.Expect(response, http.StatusOK, "remove role")
		var next appliedConfig
		response.Decode(t, &next)
		role, found := pinKVRole(next.Config, "equipe")
		if !found || role != "" {
			t.Fatalf("equipe pin kept role %q (found %v)", role, found)
		}
	})

	t.Run("disabling the data keeps the pins", func(t *testing.T) {
		response := env.Admin(http.MethodPost, applyPath, map[string]any{"kv": map[string]any{"isEnabled": false}})
		env.Expect(response, http.StatusOK, "disable data")
		var next appliedConfig
		response.Decode(t, &next)
		if next.Config.KV.IsEnabled || len(next.Config.Access.PINs) != 2 {
			t.Fatalf("unexpected config after disabling: %+v", next.Config)
		}
		data := env.PageData(page.Slug, http.MethodGet, "notas/get-all", nil, "10.0.3.9")
		if data.Code() != "kv_not_linked" && data.Status != http.StatusUnauthorized {
			t.Fatalf("data still reachable: %d %s", data.Status, data.Body)
		}
	})
}
