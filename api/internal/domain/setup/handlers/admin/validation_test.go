package admin

import (
	"testing"

	setupUtils "pocketrun-api/internal/domain/setup/utils"
)

func TestValidateStrongPassword(testingInstance *testing.T) {
	testCases := []struct {
		name        string
		password    string
		expectError bool
	}{
		{"Too short", "Ab1!", true},
		{"No letters", "12345678", true},
		{"No digits or symbols", "abcdefgh", true},
		{"Valid password with digits", "pocketrun2026", false},
		{"Valid password with symbols", "PocketRun!", false},
		{"Valid complex password", "Secure#P0cketRun", false},
	}

	for _, testCase := range testCases {
		testingInstance.Run(testCase.name, func(subTest *testing.T) {
			validationError := setupUtils.ValidateStrongPassword(testCase.password)
			if (validationError != nil) != testCase.expectError {
				subTest.Errorf("ValidateStrongPassword(%q) error = %v, expectError %v", testCase.password, validationError, testCase.expectError)
			}
		})
	}
}

