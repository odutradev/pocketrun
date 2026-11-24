package integration

import (
	"net/http"
	"strings"
	"testing"

	"pocketrun-api/tests/testenv"
)

const logoutPIN = "381904"

func TestPageLogout(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	page := env.CreatePage(map[string]any{"title": "Página", "html": "<h1>conteudo protegido</h1>"})
	env.Expect(env.Admin(http.MethodPost, "/pages/"+page.ID+"/access/keys/create", map[string]any{"role": "", "pin": logoutPIN}), http.StatusCreated, "create page pin")

	unlocked := env.UnlockPage(page.Slug, logoutPIN, "10.0.2.1")
	env.Expect(unlocked, http.StatusSeeOther, "unlock page")
	session := pageCookie(t, unlocked.Header)

	logoutPath := "/" + page.Slug + "/_/access/logout"
	withSession := func(headers map[string]string) map[string]string {
		merged := map[string]string{"Cookie": session.Name + "=" + session.Value, testenv.ClientIPHeader: "10.0.2.1"}
		for name, value := range headers {
			merged[name] = value
		}
		return merged
	}

	opened := env.Do(testenv.Request{Method: http.MethodGet, Path: "/" + page.Slug, Headers: withSession(nil)})
	if !opened.Contains("conteudo protegido") {
		t.Fatalf("unlocked page did not serve its html: %s", opened.Body)
	}

	tests := []struct {
		name     string
		headers  map[string]string
		wantCode int
		wantErr  string
	}{
		{name: "refuses a call without the page header", headers: map[string]string{}, wantCode: http.StatusForbidden, wantErr: "invalid_client"},
		{name: "refuses a cross site call", headers: map[string]string{testenv.PageDataHeader: "1", "Sec-Fetch-Site": "cross-site"}, wantCode: http.StatusForbidden, wantErr: "invalid_client"},
		{name: "refuses a call from another origin", headers: map[string]string{testenv.PageDataHeader: "1", "Origin": "https://evil.test"}, wantCode: http.StatusForbidden, wantErr: "invalid_client"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := env.Do(testenv.Request{Method: http.MethodPost, Path: logoutPath, Headers: withSession(tt.headers)})
			if response.Status != tt.wantCode || response.Code() != tt.wantErr {
				t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
			}
			if len(response.Header.Values("Set-Cookie")) != 0 {
				t.Fatalf("refused logout changed cookies: %v", response.Header.Values("Set-Cookie"))
			}
		})
	}

	t.Run("clears the page cookie", func(t *testing.T) {
		response := env.Do(testenv.Request{Method: http.MethodPost, Path: logoutPath, Headers: withSession(map[string]string{testenv.PageDataHeader: "1"})})
		env.Expect(response, http.StatusOK, "logout")
		cleared := pageCookie(t, response.Header)
		if cleared.Value != "" || cleared.MaxAge >= 0 || cleared.Path != "/"+page.Slug || !cleared.HttpOnly {
			t.Fatalf("cookie not cleared for the page path: %+v", cleared)
		}
	})

	t.Run("unknown page answers not found", func(t *testing.T) {
		response := env.Do(testenv.Request{Method: http.MethodPost, Path: "/nao-existe-" + testenv.RandomText(4) + "/_/access/logout", Headers: map[string]string{testenv.PageDataHeader: "1"}})
		if response.Status != http.StatusNotFound || response.Code() != "page_not_found" {
			t.Fatalf("status %d code %q, want 404 page_not_found", response.Status, response.Code())
		}
	})
}

func pageCookie(t *testing.T, header http.Header) *http.Cookie {
	t.Helper()
	for _, cookie := range (&http.Response{Header: header}).Cookies() {
		if strings.HasPrefix(cookie.Name, "pocketrun_page_") {
			return cookie
		}
	}
	t.Fatalf("no page cookie in %v", header.Values("Set-Cookie"))
	return nil
}
