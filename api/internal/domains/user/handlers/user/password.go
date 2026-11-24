package user

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
	"golang.org/x/crypto/argon2"
)

const (
	MinPasswordLength = 8
	MaxPasswordLength = 128
	saltLength        = 16
	argonPrefix       = "$argon2id"
	argonTime         = 2
	argonMemory       = 64 * 1024
	argonThreads      = 1
	argonKeyLength    = 32
	maxArgonTime      = 10
	maxArgonMemory    = 256 * 1024
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
	digest := argon2.IDKey([]byte(password), salt, argonTime, argonMemory, argonThreads, argonKeyLength)
	encoding := base64.RawStdEncoding
	return fmt.Sprintf("%s$v=%d$m=%d,t=%d,p=%d$%s$%s", argonPrefix, argon2.Version, argonMemory, argonTime, argonThreads, encoding.EncodeToString(salt), encoding.EncodeToString(digest)), nil
}

func checkPassword(password, storedHash string) (bool, bool) {
	if strings.HasPrefix(storedHash, argonPrefix+"$") {
		return checkArgonPassword(password, storedHash)
	}
	return checkLegacyPassword(password, storedHash), true
}

func checkArgonPassword(password, storedHash string) (bool, bool) {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 6 {
		return false, false
	}

	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || version != argon2.Version {
		return false, false
	}
	var memory, iterations uint32
	var threads uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &threads); err != nil || memory == 0 || iterations == 0 || threads == 0 {
		return false, false
	}
	if memory > maxArgonMemory || iterations > maxArgonTime {
		return false, false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, false
	}
	expected, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil || len(expected) == 0 {
		return false, false
	}

	digest := argon2.IDKey([]byte(password), salt, iterations, memory, threads, uint32(len(expected)))
	if subtle.ConstantTimeCompare(digest, expected) != 1 {
		return false, false
	}
	return true, memory != argonMemory || iterations != argonTime || threads != argonThreads || len(expected) != argonKeyLength
}

func checkLegacyPassword(password, storedHash string) bool {
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
	return hmac.Equal(legacyDigest(salt, password), expectedDigest)
}

func legacyDigest(salt []byte, password string) []byte {
	hasher := sha512.New()
	hasher.Write(salt)
	hasher.Write([]byte(password))
	return hasher.Sum(nil)
}

func burnPasswordCheck(password string) {
	argon2.IDKey([]byte(password), make([]byte, saltLength), argonTime, argonMemory, argonThreads, argonKeyLength)
}
