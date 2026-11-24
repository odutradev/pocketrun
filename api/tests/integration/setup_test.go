package integration

import (
	"net/http"
	"strings"
	"testing"

	"pocketrun-api/tests/testenv"
)

const setupTokenFailureLimit = 5

func TestSetupToken(t *testing.T) {
	tests := []struct {
		name string
		run  func(t *testing.T, env *testenv.Env)
	}{
		{
			name: "accepts the logged token",
			run: func(t *testing.T, env *testenv.Env) {
				expectSetup(t, verifySetupToken(env, env.SetupToken()), http.StatusOK, "")
			},
		},
		{
			name: "accepts the token in lowercase without the hyphen",
			run: func(t *testing.T, env *testenv.Env) {
				token := strings.ToLower(strings.ReplaceAll(env.SetupToken(), "-", ""))
				expectSetup(t, verifySetupToken(env, token), http.StatusOK, "")
			},
		},
		{
			name: "rejects a wrong token",
			run: func(t *testing.T, env *testenv.Env) {
				expectSetup(t, verifySetupToken(env, "AAAA-AAAA"), http.StatusForbidden, "invalid_setup_token")
			},
		},
		{
			name: "requires the token to create the superadmin",
			run: func(t *testing.T, env *testenv.Env) {
				expectSetup(t, createSuperadmin(env, ""), http.StatusBadRequest, "validation_failed")
				expectSetup(t, createSuperadmin(env, "AAAA-AAAA"), http.StatusForbidden, "invalid_setup_token")
				expectSetup(t, createSuperadmin(env, env.SetupToken()), http.StatusCreated, "")
			},
		},
		{
			name: "replaces the token after repeated failures",
			run: func(t *testing.T, env *testenv.Env) {
				first := env.SetupToken()
				for range setupTokenFailureLimit {
					expectSetup(t, verifySetupToken(env, "AAAA-AAAA"), http.StatusForbidden, "invalid_setup_token")
				}
				expectSetup(t, verifySetupToken(env, first), http.StatusForbidden, "invalid_setup_token")
				if env.SetupToken() == first {
					t.Fatal("setup token was not replaced")
				}
				expectSetup(t, verifySetupToken(env, env.SetupToken()), http.StatusOK, "")
			},
		},
		{
			name: "refuses the token once setup is done",
			run: func(t *testing.T, env *testenv.Env) {
				token := env.SetupToken()
				expectSetup(t, createSuperadmin(env, token), http.StatusCreated, "")
				expectSetup(t, verifySetupToken(env, token), http.StatusForbidden, "setup_completed")
				expectSetup(t, createSuperadmin(env, token), http.StatusForbidden, "setup_completed")
			},
		},
		{
			name: "refuses requests outside the panel",
			run: func(t *testing.T, env *testenv.Env) {
				response := env.Do(testenv.Request{Method: http.MethodPost, Path: "/admin/setup/token/verify", Body: map[string]string{"setupToken": env.SetupToken()}})
				expectSetup(t, response, http.StatusForbidden, "invalid_client")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.run(t, testenv.Start(t))
		})
	}
}

func verifySetupToken(env *testenv.Env, token string) testenv.Response {
	return env.Admin(http.MethodPost, "/setup/token/verify", map[string]string{"setupToken": token})
}

func createSuperadmin(env *testenv.Env, token string) testenv.Response {
	body := map[string]string{
		"name":       "Admin Teste",
		"email":      "admin-" + testenv.RandomText(4) + "@pocketrun.test",
		"password":   "Senha-" + testenv.RandomText(8),
		"setupToken": token,
	}
	return env.Admin(http.MethodPost, "/setup/admin/create", body)
}

func expectSetup(t *testing.T, response testenv.Response, status int, code string) {
	t.Helper()
	if response.Status != status || response.Code() != code {
		t.Fatalf("setup: status %d code %q, want %d %q, body %s", response.Status, response.Code(), status, code, response.Body)
	}
}
