package application

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	applicationrepository "pocketrun-api/internal/repositories/application"
	"strings"
	"time"
)

const (
	tokenPrefix      = "pk_live_"
	tokenRandomBytes = 24
)

func generateToken(name string, validityDays int, now time.Time) (string, applicationrepository.Token, error) {
	randomBytes := make([]byte, tokenRandomBytes)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", applicationrepository.Token{}, fmt.Errorf("generate token bytes: %w", err)
	}

	randomHex := hex.EncodeToString(randomBytes)
	rawToken := tokenPrefix + randomHex

	token := applicationrepository.Token{
		ID:        "tok_" + randomHex[:8],
		Name:      name,
		Hash:      hashToken(rawToken),
		Prefix:    rawToken[:12] + "...",
		CreatedAt: now,
	}
	if validityDays > 0 {
		expiresAt := now.AddDate(0, 0, validityDays)
		token.ExpiresAt = &expiresAt
	}
	return rawToken, token, nil
}

func hashToken(rawToken string) string {
	digest := sha256.Sum256([]byte(strings.TrimSpace(rawToken)))
	return hex.EncodeToString(digest[:])
}

func extractAccessToken(r *http.Request) string {
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

func findToken(tokens []applicationrepository.Token, hash string) (applicationrepository.Token, bool) {
	for _, token := range tokens {
		if token.Hash == hash {
			return token, true
		}
	}
	return applicationrepository.Token{}, false
}

func isOriginAllowed(allowedOrigins []string, origin string, allowNonBrowserRequests bool) bool {
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
