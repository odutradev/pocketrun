package analytics

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/user/middlewares/managerauth"
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
	mux.Handle("GET /apps/analytics/details", authenticate(http.HandlerFunc(h.overview)))
	mux.Handle("GET /apps/{id}/analytics/details", authenticate(http.HandlerFunc(h.details)))
}

func (h *Handler) details(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_application_id")
		return
	}

	var params traffic.AnalyticsParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	analytics, err := h.service.Application(ctx, managerID, id, params.Query())
	if errors.Is(err, ErrApplicationNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "application_not_found")
		return
	}
	if err != nil {
		h.writeInternalError(w, r, "kv application analytics", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, analytics)
}

func (h *Handler) overview(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var params traffic.AnalyticsParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	overview, err := h.service.Overview(ctx, managerID, params.Query())
	if err != nil {
		h.writeInternalError(w, r, "kv analytics overview", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, overview)
}

func (h *Handler) writeInternalError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	h.logger.ErrorContext(r.Context(), operation, "error", err)
	httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
}
