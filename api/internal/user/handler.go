package user

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/platform/httpx"
)

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
	mux.HandleFunc("POST /auth/register", h.register)
	mux.Handle("GET /auth/me", authenticate(http.HandlerFunc(h.me)))
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var input LoginInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	session, err := h.service.Login(ctx, input)
	if errors.Is(err, ErrInvalidCredentials) {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_credentials")
		return
	}
	if err != nil {
		h.logger.ErrorContext(ctx, "login", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, session)
}

func (h *Handler) register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	err := h.service.Register(ctx)
	if errors.Is(err, ErrRegistrationDisabled) {
		httpx.WriteError(w, http.StatusForbidden, "registration_disabled")
		return
	}
	if errors.Is(err, ErrSetupRequired) {
		httpx.WriteError(w, http.StatusConflict, "setup_required")
		return
	}
	h.logger.ErrorContext(ctx, "register", "error", err)
	httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := ManagerIDFromContext(ctx)
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
