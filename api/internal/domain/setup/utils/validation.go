package utils

import (
	"unicode"
)

type passwordValidationError struct {
	message string
}

func (validationError *passwordValidationError) Error() string {
	return validationError.message
}

func ValidateStrongPassword(password string) error {
	if len(password) < 8 {
		return &passwordValidationError{message: "Password must be at least 8 characters long"}
	}
	if len(password) > 128 {
		return &passwordValidationError{message: "Password must not exceed 128 characters"}
	}

	var hasLetter, hasDigitOrSymbol bool
	for _, character := range password {
		if unicode.IsLetter(character) {
			hasLetter = true
		} else if unicode.IsDigit(character) || unicode.IsPunct(character) || unicode.IsSymbol(character) {
			hasDigitOrSymbol = true
		}
	}

	if !hasLetter || !hasDigitOrSymbol {
		return &passwordValidationError{message: "Password must contain at least one letter and at least one digit or symbol"}
	}

	return nil
}

