package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"pocketrun-api/internal/config"
)

type JWTClaims struct {
	UserID         string `json:"user_id"`
	Email          string `json:"email"`
	Role           string `json:"role,omitempty"`
	ExpirationTime int64  `json:"exp"`
	IssuedAt       int64  `json:"iat"`
}

func getJWTSecret() string {
	return config.GetEnv("JWT_SECRET", "pocketrun-secret-key-change-in-production")
}

func GenerateJWT(userID, userEmail, userRole string) (string, error) {
	jwtSecret := getJWTSecret()
	if jwtSecret == "" {
		return "", errors.New("JWT secret is not configured")
	}

	tokenHeader := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}
	headerBytes, marshalHeaderError := json.Marshal(tokenHeader)
	if marshalHeaderError != nil {
		return "", marshalHeaderError
	}

	currentTime := time.Now()
	tokenClaims := JWTClaims{
		UserID:         userID,
		Email:          userEmail,
		Role:           userRole,
		IssuedAt:       currentTime.Unix(),
		ExpirationTime: currentTime.Add(7 * 24 * time.Hour).Unix(),
	}
	claimsBytes, marshalClaimsError := json.Marshal(tokenClaims)
	if marshalClaimsError != nil {
		return "", marshalClaimsError
	}

	encodedHeader := base64.RawURLEncoding.EncodeToString(headerBytes)
	encodedClaims := base64.RawURLEncoding.EncodeToString(claimsBytes)

	unsignedToken := encodedHeader + "." + encodedClaims

	hmacSigner := hmac.New(sha256.New, []byte(jwtSecret))
	hmacSigner.Write([]byte(unsignedToken))
	tokenSignature := base64.RawURLEncoding.EncodeToString(hmacSigner.Sum(nil))

	return unsignedToken + "." + tokenSignature, nil
}

func ValidateJWT(tokenString string) (*JWTClaims, error) {
	jwtSecret := getJWTSecret()
	if jwtSecret == "" {
		return nil, errors.New("JWT secret is not configured")
	}

	tokenParts := strings.Split(tokenString, ".")
	if len(tokenParts) != 3 {
		return nil, errors.New("invalid token format")
	}

	unsignedToken := tokenParts[0] + "." + tokenParts[1]
	hmacSigner := hmac.New(sha256.New, []byte(jwtSecret))
	hmacSigner.Write([]byte(unsignedToken))
	expectedSignature := base64.RawURLEncoding.EncodeToString(hmacSigner.Sum(nil))

	if !hmac.Equal([]byte(tokenParts[2]), []byte(expectedSignature)) {
		return nil, errors.New("invalid token signature")
	}

	decodedClaimsBytes, decodeClaimsError := base64.RawURLEncoding.DecodeString(tokenParts[1])
	if decodeClaimsError != nil {
		return nil, errors.New("failed to decode claims")
	}

	var tokenClaims JWTClaims
	if unmarshalError := json.Unmarshal(decodedClaimsBytes, &tokenClaims); unmarshalError != nil {
		return nil, errors.New("failed to parse claims")
	}

	if time.Now().Unix() > tokenClaims.ExpirationTime {
		return nil, errors.New("token has expired")
	}

	return &tokenClaims, nil
}
