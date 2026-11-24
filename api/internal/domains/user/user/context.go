package user

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type claimsKey struct{}

func WithClaims(ctx context.Context, claims *Claims) context.Context {
	return context.WithValue(ctx, claimsKey{}, claims)
}

func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	claims, ok := ctx.Value(claimsKey{}).(*Claims)
	return claims, ok
}

func ManagerIDFromContext(ctx context.Context) (bson.ObjectID, error) {
	claims, ok := ClaimsFromContext(ctx)
	if !ok {
		return bson.ObjectID{}, ErrInvalidToken
	}

	managerID, err := bson.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return bson.ObjectID{}, fmt.Errorf("parse manager id: %w", ErrInvalidToken)
	}
	return managerID, nil
}
