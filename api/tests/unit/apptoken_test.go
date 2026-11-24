package unit

import (
	"net/http"
	"testing"

	"pocketrun-api/internal/domains/kv/utils/apptoken"
)

func TestAppTokenExtract(t *testing.T) {
	tests := []struct {
		name    string
		headers map[string]string
		want    string
	}{
		{name: "reads controlAccess first", headers: map[string]string{"controlAccess": "a", "X-Pocket-Token": "b", "Authorization": "Bearer c"}, want: "a"},
		{name: "reads X-Pocket-Token second", headers: map[string]string{"X-Pocket-Token": "b", "Authorization": "Bearer c"}, want: "b"},
		{name: "reads bearer token", headers: map[string]string{"Authorization": "Bearer c"}, want: "c"},
		{name: "ignores other schemes", headers: map[string]string{"Authorization": "Basic c"}},
		{name: "returns empty without token"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r, err := http.NewRequest(http.MethodGet, "http://api.test/kv/notes/get-all", nil)
			if err != nil {
				t.Fatal(err)
			}
			for name, value := range tt.headers {
				r.Header.Set(name, value)
			}
			if got := apptoken.Extract(r); got != tt.want {
				t.Errorf("Extract() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestAppTokenIsOriginAllowed(t *testing.T) {
	tests := []struct {
		name            string
		allowed         []string
		origin          string
		allowNonBrowser bool
		want            bool
	}{
		{name: "allows any origin with wildcard", allowed: []string{"*"}, origin: "https://site.test", want: true},
		{name: "allows listed origin ignoring case and slash", allowed: []string{"https://Site.test/"}, origin: "https://site.test", want: true},
		{name: "rejects unlisted origin", allowed: []string{"https://site.test"}, origin: "https://other.test"},
		{name: "rejects missing origin when only browsers allowed", allowed: []string{"*"}},
		{name: "allows missing origin when non browser allowed", allowed: []string{"https://site.test"}, allowNonBrowser: true, want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := apptoken.IsOriginAllowed(tt.allowed, tt.origin, tt.allowNonBrowser); got != tt.want {
				t.Errorf("IsOriginAllowed() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestAppTokenHash(t *testing.T) {
	tests := []struct {
		name      string
		first     string
		second    string
		wantEqual bool
	}{
		{name: "ignores surrounding spaces", first: "token", second: "  token  ", wantEqual: true},
		{name: "differs for different tokens", first: "token-a", second: "token-b"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := apptoken.Hash(tt.first) == apptoken.Hash(tt.second); got != tt.wantEqual {
				t.Errorf("Hash(%q) == Hash(%q) is %v, want %v", tt.first, tt.second, got, tt.wantEqual)
			}
		})
	}
}
