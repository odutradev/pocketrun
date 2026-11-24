package overview

import (
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/domains/user/user"
	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/services/traffic"
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
	mux.Handle("GET /overview/usage/details", authenticate(http.HandlerFunc(h.usage)))
}

func (h *Handler) usage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var params traffic.AnalyticsParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	usage, err := h.service.Usage(ctx, managerID, params.Query())
	if err != nil {
		h.logger.ErrorContext(ctx, "overview usage", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, usage)
}
