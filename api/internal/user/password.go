package user

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

const (
	MinPasswordLength = 8
	MaxPasswordLength = 128
	saltLength        = 16
)

func RegisterValidations(validate *validator.Validate) error {
	err := validate.RegisterValidation("strongpassword", func(field validator.FieldLevel) bool {
		return IsStrongPassword(field.Field().String())
	})
	if err != nil {
		return fmt.Errorf("register strongpassword validation: %w", err)
	}
	return nil
}

func IsStrongPassword(password string) bool {
	if len(password) < MinPasswordLength || len(password) > MaxPasswordLength {
		return false
	}

	hasLetter := strings.ContainsFunc(password, unicode.IsLetter)
	hasDigitOrSymbol := strings.ContainsFunc(password, func(character rune) bool {
		return unicode.IsDigit(character) || unicode.IsPunct(character) || unicode.IsSymbol(character)
	})
	return hasLetter && hasDigitOrSymbol
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("generate salt: %w", err)
	}
	return hex.EncodeToString(salt) + ":" + hex.EncodeToString(digestPassword(salt, password)), nil
}

func checkPassword(password, storedHash string) bool {
	encodedSalt, encodedDigest, found := strings.Cut(storedHash, ":")
	if !found {
		return false
	}

	salt, err := hex.DecodeString(encodedSalt)
	if err != nil {
		return false
	}

	expectedDigest, err := hex.DecodeString(encodedDigest)
	if err != nil {
		return false
	}
	return hmac.Equal(digestPassword(salt, password), expectedDigest)
}

func digestPassword(salt []byte, password string) []byte {
	hasher := sha512.New()
	hasher.Write(salt)
	hasher.Write([]byte(password))
	return hasher.Sum(nil)
}
