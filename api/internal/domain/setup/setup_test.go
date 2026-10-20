package setup

import (
	"testing"
)

func TestValidateStrongPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{"Too short", "Ab1!", true},
		{"No letters", "12345678", true},
		{"No digits or symbols", "abcdefgh", true},
		{"Valid password with digits", "pocketrun2026", false},
		{"Valid password with symbols", "PocketRun!", false},
		{"Valid complex password", "Secure#P0cketRun", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateStrongPassword(tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateStrongPassword(%q) error = %v, wantErr %v", tt.password, err, tt.wantErr)
			}
		})
	}
}
