package user

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"pocketrun-api/internal/config"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string        `bson:"name" json:"name"`
	Email        string        `bson:"email" json:"email"`
	Role         string        `bson:"role" json:"role"`
	PasswordHash string        `bson:"password_hash" json:"-"`
	CreatedAt    time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time     `bson:"updated_at" json:"updated_at"`
}

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
