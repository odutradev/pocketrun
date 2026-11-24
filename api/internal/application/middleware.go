package application

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"pocketrun-api/internal/services/httpx"
)

const touchTimeout = 5 * time.Second

func Authenticate(service *Service, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			origin := r.Header.Get("Origin")

			application, token, err := service.Authenticate(ctx, extractAccessToken(r), origin)
			if err != nil {
				writeAuthenticationError(ctx, w, logger, err)
				return
			}

			allowOrigin := origin
			if allowOrigin == "" {
				allowOrigin = "*"
			}
			w.Header().Set("Access-Control-Allow-Origin", allowOrigin)
			w.Header().Set("Access-Control-Allow-Methods", httpx.AllowedMethods)
			w.Header().Set("Access-Control-Allow-Headers", httpx.AllowedHeaders)
			w.Header().Set("projectID", application.ProjectID)

			go touchToken(context.WithoutCancel(ctx), service, logger, application, token.Hash)

			next.ServeHTTP(w, r.WithContext(WithApplication(ctx, application, token.RoleName())))
		})
	}
}

func touchToken(ctx context.Context, service *Service, logger *slog.Logger, application *Application, hash string) {
	touchContext, cancel := context.WithTimeout(ctx, touchTimeout)
	defer cancel()

	if err := service.TouchToken(touchContext, application.ID, hash); err != nil {
		logger.WarnContext(touchContext, "touch token", "error", err)
	}
}

func writeAuthenticationError(ctx context.Context, w http.ResponseWriter, logger *slog.Logger, err error) {
	switch {
	case errors.Is(err, ErrMissingAccessToken):
		httpx.WriteError(w, http.StatusUnauthorized, "missing_access_token")
	case errors.Is(err, ErrInvalidAccessToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
	case errors.Is(err, ErrExpiredAccessToken):
		httpx.WriteError(w, http.StatusUnauthorized, "expired_access_token")
	case errors.Is(err, ErrRoleNotFound):
		httpx.WriteError(w, http.StatusForbidden, "role_not_found")
	case errors.Is(err, ErrOriginNotAllowed):
		httpx.WriteError(w, http.StatusForbidden, "origin_not_allowed")
	default:
		logger.ErrorContext(ctx, "authenticate application", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
