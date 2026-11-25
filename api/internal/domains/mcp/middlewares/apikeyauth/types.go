package apikeyauth

import (
	"context"

	"pocketrun-api/internal/domains/user/utils/jwt"
	apikeyrepository "pocketrun-api/internal/repositories/apikey"
)

const challenge = `Bearer realm="pocketrun"`

type scopeKey struct{}

type KeyAuthenticator interface {
	Authenticate(ctx context.Context, rawKey string) (*jwt.Claims, apikeyrepository.Scope, error)
}
