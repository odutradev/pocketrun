package managerauth

import (
	"context"

	"pocketrun-api/internal/domains/user/utils/jwt"
)

type claimsKey struct{}

type SessionChecker interface {
	CheckSession(ctx context.Context, claims *jwt.Claims) error
}
