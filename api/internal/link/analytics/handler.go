package analytics

import (
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/services/traffic"
)

type Handler struct {
	service  *Service
	links    TargetFinder
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *Service, links TargetFinder, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, links: links, validate: validate, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /links/analytics/details", authenticate(http.HandlerFunc(h.overview)))
	mux.Handle("GET /links/{id}/analytics/details", authenticate(http.HandlerFunc(h.details)))
}

func (h *Handler) details(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_link_id")
		return
	}

	var params traffic.AnalyticsParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	targets, err := h.links.Targets(ctx, []bson.ObjectID{id})
	if err != nil {
		h.writeInternalError(w, r, "link analytics", err)
		return
	}
	if len(targets) == 0 {
		httpx.WriteError(w, http.StatusNotFound, "link_not_found")
		return
	}

	analytics, err := h.service.Link(ctx, targets[0], params.Query())
	if err != nil {
		h.writeInternalError(w, r, "link analytics", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, analytics)
}

func (h *Handler) overview(w http.ResponseWriter, r *http.Request) {
	var params traffic.AnalyticsParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	overview, err := h.service.Overview(r.Context(), params.Query(), h.links)
	if err != nil {
		h.writeInternalError(w, r, "links overview", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, overview)
}

func (h *Handler) writeInternalError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	h.logger.ErrorContext(r.Context(), operation, "error", err)
	httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
}
