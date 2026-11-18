package user

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

const TokenTTL = 7 * 24 * time.Hour

type Claims struct {
	UserID    string `json:"userId"`
	Email     string `json:"email"`
	Role      string `json:"role,omitempty"`
	Version   int    `json:"ver"`
	ExpiresAt int64  `json:"exp"`
	IssuedAt  int64  `json:"iat"`
}

type tokenHeader struct {
	Algorithm string `json:"alg"`
	Type      string `json:"typ"`
}

type TokenSigner struct {
	secret []byte
}

func NewTokenSigner(secret string) *TokenSigner {
	return &TokenSigner{secret: []byte(secret)}
}

func (s *TokenSigner) Sign(user *User) (string, error) {
	role := user.Role
	if role == "" {
		role = RoleAdmin
	}

	header, err := json.Marshal(tokenHeader{Algorithm: "HS256", Type: "JWT"})
	if err != nil {
		return "", fmt.Errorf("marshal token header: %w", err)
	}

	now := time.Now()
	claims, err := json.Marshal(Claims{
		UserID:    user.ID.Hex(),
		Email:     user.Email,
		Role:      role,
		Version:   user.TokenVersion,
		IssuedAt:  now.Unix(),
		ExpiresAt: now.Add(TokenTTL).Unix(),
	})
	if err != nil {
		return "", fmt.Errorf("marshal token claims: %w", err)
	}

	unsigned := base64.RawURLEncoding.EncodeToString(header) + "." + base64.RawURLEncoding.EncodeToString(claims)
	return unsigned + "." + s.signature(unsigned), nil
}

func (s *TokenSigner) Verify(token string) (*Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, ErrInvalidToken
	}

	if !hmac.Equal([]byte(parts[2]), []byte(s.signature(parts[0]+"."+parts[1]))) {
		return nil, ErrInvalidToken
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("decode token claims: %w", ErrInvalidToken)
	}

	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("parse token claims: %w", ErrInvalidToken)
	}

	if time.Now().Unix() > claims.ExpiresAt {
		return nil, ErrExpiredToken
	}
	return &claims, nil
}

func (s *TokenSigner) signature(unsigned string) string {
	signer := hmac.New(sha256.New, s.secret)
	signer.Write([]byte(unsigned))
	return base64.RawURLEncoding.EncodeToString(signer.Sum(nil))
}
