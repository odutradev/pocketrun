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
	mux.HandleFunc("POST /setup/token/verify", h.verifyToken)
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

func (h *Handler) verifyToken(w http.ResponseWriter, r *http.Request) {
	if !sessioncookie.IsPanelRequest(r) {
		httpx.WriteError(w, http.StatusForbidden, "invalid_client")
		return
	}

	var input TokenInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	if err := h.service.VerifyToken(r.Context(), input.SetupToken); err != nil {
		h.writeError(w, r, "verify setup token", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "setup token accepted")
}

func (h *Handler) createAdmin(w http.ResponseWriter, r *http.Request) {
	if !sessioncookie.IsPanelRequest(r) {
		httpx.WriteError(w, http.StatusForbidden, "invalid_client")
		return
	}

	var input CreateAdminInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	session, err := h.service.CreateAdmin(r.Context(), input)
	if err != nil {
		h.writeError(w, r, "create superadmin", err)
		return
	}
	h.session.Set(w, session.Token)
	httpx.WriteJSON(w, http.StatusCreated, session)
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, ErrSetupCompleted):
		httpx.WriteError(w, http.StatusForbidden, "setup_completed")
	case errors.Is(err, ErrInvalidSetupToken):
		httpx.WriteError(w, http.StatusForbidden, "invalid_setup_token")
	case errors.Is(err, user.ErrEmailTaken):
		httpx.WriteError(w, http.StatusConflict, "email_taken")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
