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

func GenerateAPIToken(tokenName string, validityDays int) (string, Token, error) {
	randomBytes := make([]byte, 24)
	if _, readError := rand.Read(randomBytes); readError != nil {
		return "", Token{}, fmt.Errorf("failed to generate random token: %w", readError)
	}

	randomHexString := hex.EncodeToString(randomBytes)
	rawToken := fmt.Sprintf("pk_live_%s", randomHexString)

	tokenHash := HashAPIToken(rawToken)
	tokenID := fmt.Sprintf("tok_%s", randomHexString[:8])
	tokenPrefix := rawToken[:12] + "..."

	currentTime := time.Now()
	var expirationDate *time.Time
	if validityDays > 0 {
		calculatedExpiration := currentTime.AddDate(0, 0, validityDays)
		expirationDate = &calculatedExpiration
	}

	generatedToken := Token{
		ID:          tokenID,
		Name:        tokenName,
		TokenHash:   tokenHash,
		TokenPrefix: tokenPrefix,
		ExpiresAt:   expirationDate,
		CreatedAt:   currentTime,
	}

	return rawToken, generatedToken, nil
}

func HashAPIToken(rawToken string) string {
	sha256Hash := sha256.Sum256([]byte(strings.TrimSpace(rawToken)))
	return hex.EncodeToString(sha256Hash[:])
}

func IsOriginAllowed(allowedOrigins []string, originHeader string, allowNonBrowserRequests bool) bool {
	trimmedOrigin := strings.TrimSpace(originHeader)

	if trimmedOrigin == "" {
		return allowNonBrowserRequests
	}

	trimmedOrigin = strings.TrimSuffix(trimmedOrigin, "/")

	for _, allowedOrigin := range allowedOrigins {
		allowedOrigin = strings.TrimSpace(allowedOrigin)
		if allowedOrigin == "*" {
			return true
		}
		normalizedAllowedOrigin := strings.TrimSuffix(allowedOrigin, "/")
		if strings.EqualFold(normalizedAllowedOrigin, trimmedOrigin) {
			return true
		}
	}

	return false
}
