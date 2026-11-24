package appauth

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"pocketrun-api/internal/domains/kv/utils/apptoken"
	"pocketrun-api/internal/domains/kv/utils/roles"
	applicationrepository "pocketrun-api/internal/repositories/application"
	"pocketrun-api/internal/services/httpx"
)

func WithApplication(ctx context.Context, application *applicationrepository.Application, role string) context.Context {
	return context.WithValue(ctx, applicationKey{}, grant{application: application, role: role})
}

func FromContext(ctx context.Context) (*applicationrepository.Application, bool) {
	value, ok := ctx.Value(applicationKey{}).(grant)
	return value.application, ok && value.application != nil
}

func RoleFromContext(ctx context.Context) string {
	value, ok := ctx.Value(applicationKey{}).(grant)
	if !ok || value.role == "" {
		return applicationrepository.AdminRole
	}
	return value.role
}

func Authenticate(service Authenticator, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			origin := r.Header.Get("Origin")

			application, token, err := service.Authenticate(ctx, apptoken.Extract(r), origin)
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

func touchToken(ctx context.Context, service Authenticator, logger *slog.Logger, application *applicationrepository.Application, hash string) {
	touchContext, cancel := context.WithTimeout(ctx, touchTimeout)
	defer cancel()

	if err := service.TouchToken(touchContext, application.ID, hash); err != nil {
		logger.WarnContext(touchContext, "touch token", "error", err)
	}
}

func writeAuthenticationError(ctx context.Context, w http.ResponseWriter, logger *slog.Logger, err error) {
	switch {
	case errors.Is(err, apptoken.ErrMissing):
		httpx.WriteError(w, http.StatusUnauthorized, "missing_access_token")
	case errors.Is(err, apptoken.ErrInvalid):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
	case errors.Is(err, apptoken.ErrExpired):
		httpx.WriteError(w, http.StatusUnauthorized, "expired_access_token")
	case errors.Is(err, roles.ErrNotFound):
		httpx.WriteError(w, http.StatusForbidden, "role_not_found")
	case errors.Is(err, apptoken.ErrOriginDenied):
		httpx.WriteError(w, http.StatusForbidden, "origin_not_allowed")
	default:
		logger.ErrorContext(ctx, "authenticate application", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
