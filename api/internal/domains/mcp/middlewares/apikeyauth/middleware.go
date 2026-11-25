package apikeyauth

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"pocketrun-api/internal/domains/user/middlewares/managerauth"
	apikeyrepository "pocketrun-api/internal/repositories/apikey"
	"pocketrun-api/internal/services/httpx"
)

func WithScope(ctx context.Context, scope apikeyrepository.Scope) context.Context {
	return context.WithValue(ctx, scopeKey{}, scope)
}

func ScopeFromContext(ctx context.Context) (apikeyrepository.Scope, bool) {
	scope, ok := ctx.Value(scopeKey{}).(apikeyrepository.Scope)
	return scope, ok
}

func Authenticate(keys KeyAuthenticator, invalid error, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			rawKey, found := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
			if !found || strings.TrimSpace(rawKey) == "" {
				w.Header().Set("WWW-Authenticate", challenge)
				httpx.WriteError(w, http.StatusUnauthorized, "missing_authorization")
				return
			}

			claims, scope, err := keys.Authenticate(r.Context(), rawKey)
			if errors.Is(err, invalid) {
				w.Header().Set("WWW-Authenticate", challenge)
				httpx.WriteError(w, http.StatusUnauthorized, "invalid_api_key")
				return
			}
			if err != nil {
				logger.ErrorContext(r.Context(), "authenticate api key", "error", err)
				httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
				return
			}

			ctx := WithScope(managerauth.WithClaims(r.Context(), claims), scope)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
