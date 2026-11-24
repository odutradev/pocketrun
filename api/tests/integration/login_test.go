package integration

import (
	"fmt"
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

const (
	emailFailureLimit  = 5
	clientFailureLimit = 20
)

func TestLoginLimits(t *testing.T) {
	tests := []struct {
		name string
		run  func(t *testing.T, env *testenv.Env)
	}{
		{
			name: "blocks an email after repeated failures",
			run: func(t *testing.T, env *testenv.Env) {
				failLogins(t, env, env.Email, "10.0.3.1", emailFailureLimit)
				expectLogin(t, env.Login(env.Email, env.Password(), from("10.0.3.2")), http.StatusTooManyRequests, "too_many_login_attempts")
			},
		},
		{
			name: "successful login resets the email count",
			run: func(t *testing.T, env *testenv.Env) {
				failLogins(t, env, env.Email, "10.0.3.1", emailFailureLimit-1)
				expectLogin(t, env.Login(env.Email, env.Password(), from("10.0.3.1")), http.StatusOK, "")
				failLogins(t, env, env.Email, "10.0.3.1", emailFailureLimit)
				expectLogin(t, env.Login(env.Email, "Errada-123", from("10.0.3.1")), http.StatusTooManyRequests, "too_many_login_attempts")
			},
		},
		{
			name: "blocks a client trying many emails",
			run: func(t *testing.T, env *testenv.Env) {
				for index := range clientFailureLimit {
					failLogins(t, env, fmt.Sprintf("pessoa-%d@pocketrun.test", index), "10.0.3.5", 1)
				}
				expectLogin(t, env.Login("outra@pocketrun.test", "Errada-123", from("10.0.3.5")), http.StatusTooManyRequests, "too_many_login_attempts")
				expectLogin(t, env.Login(env.Email, env.Password(), from("10.0.3.6")), http.StatusOK, "")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			env := testenv.Start(t)
			env.Setup()
			tt.run(t, env)
		})
	}
}

func failLogins(t *testing.T, env *testenv.Env, email, ip string, attempts int) {
	t.Helper()
	for range attempts {
		expectLogin(t, env.Login(email, "Errada-123", from(ip)), http.StatusUnauthorized, "invalid_credentials")
	}
}

func expectLogin(t *testing.T, response testenv.Response, status int, code string) {
	t.Helper()
	if response.Status != status || response.Code() != code {
		t.Fatalf("login: status %d code %q, want %d %q", response.Status, response.Code(), status, code)
	}
}

func from(ip string) map[string]string {
	return map[string]string{testenv.ClientIPHeader: ip}
}
