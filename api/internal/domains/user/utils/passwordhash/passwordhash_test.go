package passwordhash

import "testing"

func TestIsStrong(t *testing.T) {
	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{name: "rejects short password", password: "Ab1!", want: false},
		{name: "rejects password without letters", password: "12345678", want: false},
		{name: "rejects password without digits or symbols", password: "abcdefgh", want: false},
		{name: "accepts letters with digits", password: "pocketrun2026", want: true},
		{name: "accepts letters with symbols", password: "PocketRun!", want: true},
		{name: "accepts complex password", password: "Secure#P0cketRun", want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsStrong(tt.password); got != tt.want {
				t.Errorf("IsStrong(%q) = %v, want %v", tt.password, got, tt.want)
			}
		})
	}
}
