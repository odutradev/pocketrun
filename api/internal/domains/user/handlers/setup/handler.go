package setup

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/domains/user/utils/sessioncookie"
	"pocketrun-api/internal/services/httpx"
)

type Handler struct {
	service  *Service
	session  sessioncookie.Cookie
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *Service, session sessioncookie.Cookie, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, session: session, validate: validate, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /setup/status/details", h.getStatus)
	mux.HandleFunc("POST /setup/admin/create", h.createAdmin)
}

func (h *Handler) getStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	status, err := h.service.GetStatus(ctx)
	if err != nil {
		h.logger.ErrorContext(ctx, "get setup status", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, status)
}

func (h *Handler) createAdmin(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	if !sessioncookie.IsPanelRequest(r) {
		httpx.WriteError(w, http.StatusForbidden, "invalid_client")
		return
	}

	var input user.CreateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	session, err := h.service.CreateAdmin(ctx, input)
	if errors.Is(err, ErrSetupCompleted) {
		httpx.WriteError(w, http.StatusForbidden, "setup_completed")
		return
	}
	if errors.Is(err, user.ErrEmailTaken) {
		httpx.WriteError(w, http.StatusConflict, "email_taken")
		return
	}
	if err != nil {
		h.logger.ErrorContext(ctx, "create superadmin", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	h.session.Set(w, session.Token)
	httpx.WriteJSON(w, http.StatusCreated, session)
}
