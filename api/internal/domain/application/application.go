package application

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Token struct {
	ID          string     `bson:"id" json:"id"`
	Name        string     `bson:"name" json:"name"`
	TokenHash   string     `bson:"token_hash" json:"-"`
	TokenPrefix string     `bson:"token_prefix" json:"token_prefix"`
	ExpiresAt   *time.Time `bson:"expires_at,omitempty" json:"expires_at"`
	CreatedAt   time.Time  `bson:"created_at" json:"created_at"`
	LastUsedAt  *time.Time `bson:"last_used_at,omitempty" json:"last_used_at"`
}

type Application struct {
	ID                      bson.ObjectID `bson:"_id,omitempty" json:"id"`
	ManagerID               bson.ObjectID `bson:"manager_id" json:"manager_id"`
	Name                    string        `bson:"name" json:"name"`
	ProjectID               string        `bson:"project_id" json:"project_id"`
	Description             string        `bson:"description" json:"description"`
	AllowedOrigins          []string      `bson:"allowed_origins" json:"allowed_origins"`
	AllowNonBrowserRequests bool          `bson:"allow_non_browser_requests" json:"allow_non_browser_requests"`
	Tokens                  []Token       `bson:"tokens" json:"tokens,omitempty"`
	CreatedAt               time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt               time.Time     `bson:"updated_at" json:"updated_at"`
}

// GenerateAPIToken creates a new API token with prefix pk_live_, computes its SHA-256 hash
func GenerateAPIToken(name string, validityDays int) (string, Token, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", Token{}, fmt.Errorf("failed to generate random token: %w", err)
	}

	randomStr := hex.EncodeToString(bytes)
	rawToken := fmt.Sprintf("pk_live_%s", randomStr)

	tokenHash := HashAPIToken(rawToken)
	tokenID := fmt.Sprintf("tok_%s", randomStr[:8])
	prefix := rawToken[:12] + "..."

	now := time.Now()
	var expiresAt *time.Time
	if validityDays > 0 {
		exp := now.AddDate(0, 0, validityDays)
		expiresAt = &exp
	}

	tokenStruct := Token{
		ID:          tokenID,
		Name:        name,
		TokenHash:   tokenHash,
		TokenPrefix: prefix,
		ExpiresAt:   expiresAt,
		CreatedAt:   now,
	}

	return rawToken, tokenStruct, nil
}

// HashAPIToken returns SHA-256 hex hash of plaintext token
func HashAPIToken(rawToken string) string {
	h := sha256.Sum256([]byte(strings.TrimSpace(rawToken)))
	return hex.EncodeToString(h[:])
}

// IsOriginAllowed checks if request origin is authorized by application settings
func IsOriginAllowed(allowedOrigins []string, originHeader string, allowNonBrowser bool) bool {
	originHeader = strings.TrimSpace(originHeader)

	// If no Origin header (e.g. mobile app, curl, server-to-server)
	if originHeader == "" {
		return allowNonBrowser
	}

	// Normalize trailing slashes
	originHeader = strings.TrimSuffix(originHeader, "/")

	for _, allowed := range allowedOrigins {
		allowed = strings.TrimSpace(allowed)
		if allowed == "*" {
			return true
		}
		allowedNormalized := strings.TrimSuffix(allowed, "/")
		if strings.EqualFold(allowedNormalized, originHeader) {
			return true
		}
	}

	return false
}
