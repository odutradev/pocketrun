package user

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/user/middlewares/managerauth"
	"pocketrun-api/internal/domains/user/utils/sessioncookie"
	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/utils"
)

const retryAfterSeconds = "900"

type Handler struct {
	service  *Service
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *Service, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, validate: validate, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.HandleFunc("POST /auth/login", h.login)
	mux.HandleFunc("POST /auth/logout", h.logout)
	mux.Handle("POST /auth/sessions/revoke", authenticate(http.HandlerFunc(h.revokeSessions)))
	mux.Handle("GET /auth/me/details", authenticate(http.HandlerFunc(h.me)))
	mux.Handle("PATCH /auth/me/update", authenticate(http.HandlerFunc(h.updateProfile)))
	mux.Handle("PATCH /auth/me/password/update", authenticate(http.HandlerFunc(h.changePassword)))
	mux.Handle("GET /users/list", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("POST /users/create", authenticate(http.HandlerFunc(h.create)))
	mux.Handle("PATCH /users/{id}/update", authenticate(http.HandlerFunc(h.update)))
	mux.Handle("DELETE /users/{id}/delete", authenticate(http.HandlerFunc(h.remove)))
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if !sessioncookie.IsPanelRequest(r) {
		httpx.WriteError(w, http.StatusForbidden, "invalid_client")
		return
	}

	var input LoginInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	session, err := h.service.Login(ctx, input, utils.ClientIP(r))
	if errors.Is(err, ErrInvalidCredentials) {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_credentials")
		return
	}
	if errors.Is(err, ErrTooManyAttempts) {
		w.Header().Set("Retry-After", retryAfterSeconds)
		httpx.WriteError(w, http.StatusTooManyRequests, "too_many_login_attempts")
		return
	}
	if err != nil {
		h.logger.ErrorContext(ctx, "login", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	sessioncookie.Set(w, session.Token)
	httpx.WriteJSON(w, http.StatusOK, session)
}

func (h *Handler) logout(w http.ResponseWriter, r *http.Request) {
	if !sessioncookie.IsPanelRequest(r) {
		httpx.WriteError(w, http.StatusForbidden, "invalid_client")
		return
	}
	sessioncookie.Clear(w)
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) revokeSessions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	if err := h.service.RevokeSessions(ctx, managerID); err != nil {
		h.writeServiceError(ctx, w, "revoke sessions", err)
		return
	}
	sessioncookie.Clear(w)
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	user, err := h.service.GetUserByID(ctx, managerID)
	if errors.Is(err, ErrUserNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "user_not_found")
		return
	}
	if err != nil {
		h.logger.ErrorContext(ctx, "get current user", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) updateProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input ProfileInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	user, err := h.service.UpdateProfile(ctx, managerID, input)
	if err != nil {
		h.writeServiceError(ctx, w, "update profile", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) changePassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input PasswordInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	session, err := h.service.ChangePassword(ctx, managerID, input)
	if err != nil {
		h.writeServiceError(ctx, w, "change password", err)
		return
	}
	sessioncookie.Set(w, session.Token)
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	users, err := h.service.List(ctx, managerID)
	if err != nil {
		h.writeServiceError(ctx, w, "list users", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, users)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input ManageInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	user, err := h.service.CreateByManager(ctx, managerID, input)
	if err != nil {
		h.writeServiceError(ctx, w, "create user", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, user)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeServiceError(ctx, w, "update user", err)
		return
	}

	var input UpdateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	user, err := h.service.UpdateByManager(ctx, managerID, id, input)
	if err != nil {
		h.writeServiceError(ctx, w, "update user", err)
		return
	}
	if id == managerID {
		session, err := h.service.IssueSession(user)
		if err != nil {
			h.writeServiceError(ctx, w, "update user", err)
			return
		}
		sessioncookie.Set(w, session.Token)
	}
	httpx.WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) remove(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeServiceError(ctx, w, "remove user", err)
		return
	}

	if err := h.service.Remove(ctx, managerID, id); err != nil {
		h.writeServiceError(ctx, w, "remove user", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) writeServiceError(ctx context.Context, w http.ResponseWriter, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
	case errors.Is(err, ErrInvalidUserID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_user_id")
	case errors.Is(err, ErrForbidden):
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
	case errors.Is(err, ErrSelfAction):
		httpx.WriteError(w, http.StatusConflict, "self_action_forbidden")
	case errors.Is(err, ErrUserHasApplications):
		httpx.WriteError(w, http.StatusConflict, "user_has_applications")
	case errors.Is(err, ErrInvalidPassword):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_current_password")
	case errors.Is(err, ErrEmailTaken):
		httpx.WriteError(w, http.StatusConflict, "email_taken")
	case errors.Is(err, ErrUserNotFound):
		httpx.WriteError(w, http.StatusNotFound, "user_not_found")
	default:
		h.logger.ErrorContext(ctx, operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}

func parseIDs(r *http.Request) (bson.ObjectID, bson.ObjectID, error) {
	managerID, err := managerauth.ManagerIDFromContext(r.Context())
	if err != nil {
		return bson.ObjectID{}, bson.ObjectID{}, fmt.Errorf("parse manager id: %w", err)
	}

	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		return bson.ObjectID{}, bson.ObjectID{}, ErrInvalidUserID
	}
	return managerID, id, nil
}
