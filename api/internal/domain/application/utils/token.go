package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"

	tokensRepo "pocketrun-api/internal/domain/application/repositories/tokens"
)

func GenerateAPIToken(tokenName string, validityDays int) (string, tokensRepo.Token, error) {
	randomBytes := make([]byte, 24)
	if _, readError := rand.Read(randomBytes); readError != nil {
		return "", tokensRepo.Token{}, fmt.Errorf("failed to generate random token: %w", readError)
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

	generatedToken := tokensRepo.Token{
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

func ExtractAccessToken(request *http.Request) string {
	if controlAccessToken := request.Header.Get("controlAccess"); controlAccessToken != "" {
		return controlAccessToken
	}
	if pocketToken := request.Header.Get("X-Pocket-Token"); pocketToken != "" {
		return pocketToken
	}
	authorizationHeader := request.Header.Get("Authorization")
	if strings.HasPrefix(authorizationHeader, "Bearer ") {
		return strings.TrimPrefix(authorizationHeader, "Bearer ")
	}
	return ""
}

func FindMatchingToken(tokens []tokensRepo.Token, tokenHash string) *tokensRepo.Token {
	for tokenIndex := range tokens {
		if tokens[tokenIndex].TokenHash == tokenHash {
			return &tokens[tokenIndex]
		}
	}
	return nil
}

func IsTokenExpired(token *tokensRepo.Token) bool {
	return token != nil && token.ExpiresAt != nil && time.Now().After(*token.ExpiresAt)
}

