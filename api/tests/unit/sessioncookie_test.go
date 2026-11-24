package unit

import (
	"net/http/httptest"
	"testing"

	"pocketrun-api/internal/domains/user/utils/sessioncookie"
)

func TestSessionCookie(t *testing.T) {
	tests := []struct {
		name       string
		allowsHTTP bool
		wantName   string
		wantSecure bool
	}{
		{name: "https only uses a secure host cookie", allowsHTTP: false, wantName: sessioncookie.SecureName, wantSecure: true},
		{name: "allowing http drops secure and the host prefix", allowsHTTP: true, wantName: sessioncookie.InsecureName, wantSecure: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			session := sessioncookie.New(tt.allowsHTTP)
			if session.Name() != tt.wantName {
				t.Fatalf("name %q, want %q", session.Name(), tt.wantName)
			}

			recorder := httptest.NewRecorder()
			session.Set(recorder, "token")
			cookies := recorder.Result().Cookies()
			if len(cookies) != 1 {
				t.Fatalf("got %d cookies, want 1", len(cookies))
			}
			cookie := cookies[0]
			if cookie.Name != tt.wantName || cookie.Secure != tt.wantSecure || !cookie.HttpOnly || cookie.Value != "token" {
				t.Fatalf("cookie %+v, want name %q secure %v http only", cookie, tt.wantName, tt.wantSecure)
			}

			recorder = httptest.NewRecorder()
			session.Clear(recorder)
			cleared := recorder.Result().Cookies()
			if len(cleared) != 1 || cleared[0].Name != tt.wantName || cleared[0].MaxAge >= 0 {
				t.Fatalf("clear sent %+v, want an expired %q", cleared, tt.wantName)
			}
		})
	}
}
