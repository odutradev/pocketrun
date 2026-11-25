package managerauth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/user/utils/jwt"
	"pocketrun-api/internal/domains/user/utils/sessioncookie"
	"pocketrun-api/internal/services/httpx"
)

func WithClaims(ctx context.Context, claims *jwt.Claims) context.Context {
	return context.WithValue(ctx, claimsKey{}, claims)
}

func ClaimsFromContext(ctx context.Context) (*jwt.Claims, bool) {
	claims, ok := ctx.Value(claimsKey{}).(*jwt.Claims)
	return claims, ok
}

func ManagerIDFromContext(ctx context.Context) (bson.ObjectID, error) {
	claims, ok := ClaimsFromContext(ctx)
	if !ok {
		return bson.ObjectID{}, jwt.ErrInvalidToken
	}

	managerID, err := bson.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return bson.ObjectID{}, fmt.Errorf("parse manager id: %w", jwt.ErrInvalidToken)
	}
	return managerID, nil
}

func Authenticate(signer *jwt.Signer, sessions SessionChecker, session sessioncookie.Cookie, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := ClaimsFromContext(r.Context()); ok {
				next.ServeHTTP(w, r)
				return
			}

			if !sessioncookie.IsPanelRequest(r) {
				httpx.WriteError(w, http.StatusForbidden, "invalid_client")
				return
			}

			cookie, err := r.Cookie(session.Name())
			if err != nil || cookie.Value == "" {
				httpx.WriteError(w, http.StatusUnauthorized, "missing_authorization")
				return
			}

			claims, err := signer.Verify(cookie.Value)
			if err != nil {
				session.Clear(w)
				httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
				return
			}

			err = sessions.CheckSession(r.Context(), claims)
			if errors.Is(err, jwt.ErrInvalidToken) {
				session.Clear(w)
				httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
				return
			}
			if err != nil {
				logger.ErrorContext(r.Context(), "check session", "error", err)
				httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
				return
			}
			next.ServeHTTP(w, r.WithContext(WithClaims(r.Context(), claims)))
		})
	}
}
