package user

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"pocketrun-api/internal/platform/httpx"
)

type SessionChecker interface {
	CheckSession(ctx context.Context, claims *Claims) error
}

func Authenticate(signer *TokenSigner, sessions SessionChecker, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !IsPanelRequest(r) {
				httpx.WriteError(w, http.StatusForbidden, "invalid_client")
				return
			}

			cookie, err := r.Cookie(SessionCookieName)
			if err != nil || cookie.Value == "" {
				httpx.WriteError(w, http.StatusUnauthorized, "missing_authorization")
				return
			}

			claims, err := signer.Verify(cookie.Value)
			if err != nil {
				ClearSessionCookie(w)
				httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
				return
			}

			err = sessions.CheckSession(r.Context(), claims)
			if errors.Is(err, ErrInvalidToken) {
				ClearSessionCookie(w)
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
