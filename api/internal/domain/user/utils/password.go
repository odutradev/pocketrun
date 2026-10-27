package utils

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"strings"
)

func HashPassword(plainPassword string) (string, error) {
	randomSalt := make([]byte, 16)
	if _, readError := rand.Read(randomSalt); readError != nil {
		return "", fmt.Errorf("failed to generate salt: %w", readError)
	}

	sha512Hasher := sha512.New()
	sha512Hasher.Write(randomSalt)
	sha512Hasher.Write([]byte(plainPassword))
	passwordHash := sha512Hasher.Sum(nil)

	return fmt.Sprintf("%s:%s", hex.EncodeToString(randomSalt), hex.EncodeToString(passwordHash)), nil
}

func CheckPassword(plainPassword, storedPasswordHash string) bool {
	hashParts := strings.SplitN(storedPasswordHash, ":", 2)
	if len(hashParts) != 2 {
		return false
	}

	decodedSalt, decodeSaltError := hex.DecodeString(hashParts[0])
	if decodeSaltError != nil {
		return false
	}

	expectedHash, decodeHashError := hex.DecodeString(hashParts[1])
	if decodeHashError != nil {
		return false
	}

	sha512Hasher := sha512.New()
	sha512Hasher.Write(decodedSalt)
	sha512Hasher.Write([]byte(plainPassword))
	calculatedHash := sha512Hasher.Sum(nil)

	return hmac.Equal(calculatedHash, expectedHash)
}

