package unit

import (
	"regexp"
	"testing"

	"pocketrun-api/internal/domains/user/utils/setuptoken"
)

var setupTokenFormat = regexp.MustCompile(`^[ABCDEFGHJKLMNPQRSTUVWXYZ2-9]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ2-9]{4}$`)

func TestSetupTokenGenerate(t *testing.T) {
	seen := map[string]bool{}
	for range 50 {
		token, err := setuptoken.Generate()
		if err != nil {
			t.Fatalf("Generate() error = %v", err)
		}
		if !setupTokenFormat.MatchString(token) {
			t.Fatalf("Generate() = %q, want two groups of 4 unambiguous characters", token)
		}
		seen[token] = true
	}
	if len(seen) < 45 {
		t.Errorf("Generate() repeated tokens: %d distinct of 50", len(seen))
	}
}

func TestSetupTokenMatches(t *testing.T) {
	tests := []struct {
		name     string
		expected string
		given    string
		want     bool
	}{
		{name: "accepts the exact token", expected: "ABCD-EF23", given: "ABCD-EF23", want: true},
		{name: "accepts lowercase", expected: "ABCD-EF23", given: "abcd-ef23", want: true},
		{name: "accepts without the hyphen", expected: "ABCD-EF23", given: "ABCDEF23", want: true},
		{name: "accepts surrounding spaces", expected: "ABCD-EF23", given: "  ABCD EF23 ", want: true},
		{name: "rejects another token", expected: "ABCD-EF23", given: "ABCD-EF24"},
		{name: "rejects a prefix", expected: "ABCD-EF23", given: "ABCD"},
		{name: "rejects empty input", expected: "ABCD-EF23"},
		{name: "rejects when no token exists", given: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := setuptoken.Matches(tt.expected, tt.given); got != tt.want {
				t.Errorf("Matches(%q, %q) = %v, want %v", tt.expected, tt.given, got, tt.want)
			}
		})
	}
}
