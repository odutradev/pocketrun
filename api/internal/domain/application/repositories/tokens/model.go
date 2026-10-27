package tokens

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
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
