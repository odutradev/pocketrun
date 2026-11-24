package apptoken

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	applicationrepository "pocketrun-api/internal/repositories/application"
)

var (
	ErrMissing      = errors.New("access token missing")
	ErrInvalid      = errors.New("invalid access token")
	ErrExpired      = errors.New("access token expired")
	ErrOriginDenied = errors.New("origin not allowed")
)

const (
	tokenPrefix      = "pk_live_"
	tokenRandomBytes = 24
)

func Generate(name string, validityDays int, now time.Time) (string, applicationrepository.Token, error) {
	randomBytes := make([]byte, tokenRandomBytes)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", applicationrepository.Token{}, fmt.Errorf("generate token bytes: %w", err)
	}

	randomHex := hex.EncodeToString(randomBytes)
	rawToken := tokenPrefix + randomHex

	token := applicationrepository.Token{
		ID:        "tok_" + randomHex[:8],
		Name:      name,
		Hash:      Hash(rawToken),
		Prefix:    rawToken[:12] + "...",
		CreatedAt: now,
	}
	if validityDays > 0 {
		expiresAt := now.AddDate(0, 0, validityDays)
		token.ExpiresAt = &expiresAt
	}
	return rawToken, token, nil
}

func Hash(rawToken string) string {
	digest := sha256.Sum256([]byte(strings.TrimSpace(rawToken)))
	return hex.EncodeToString(digest[:])
}

func Extract(r *http.Request) string {
	if token := r.Header.Get("controlAccess"); token != "" {
		return token
	}
	if token := r.Header.Get("X-Pocket-Token"); token != "" {
		return token
	}
	if token, found := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer "); found {
		return token
	}
	return ""
}

func Find(tokens []applicationrepository.Token, hash string) (applicationrepository.Token, bool) {
	for _, token := range tokens {
		if token.Hash == hash {
			return token, true
		}
	}
	return applicationrepository.Token{}, false
}

func IsOriginAllowed(allowedOrigins []string, origin string, allowNonBrowserRequests bool) bool {
	normalizedOrigin := strings.TrimSuffix(strings.TrimSpace(origin), "/")
	if normalizedOrigin == "" {
		return allowNonBrowserRequests
	}

	for _, allowedOrigin := range allowedOrigins {
		normalizedAllowed := strings.TrimSuffix(strings.TrimSpace(allowedOrigin), "/")
		if normalizedAllowed == "*" || strings.EqualFold(normalizedAllowed, normalizedOrigin) {
			return true
		}
	}
	return false
}
