package history

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	historyservice "pocketrun-api/internal/services/history"
	"pocketrun-api/internal/services/httpx"
)

type ExpiryFinder interface {
	ExpiredAt(ctx context.Context, id bson.ObjectID) (*time.Time, error)
}

type Handler struct {
	service  *historyservice.Service
	pages    ExpiryFinder
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *historyservice.Service, pages ExpiryFinder, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, pages: pages, validate: validate, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /pages/{id}/history/list", authenticate(http.HandlerFunc(h.list)))
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_page_id")
		return
	}

	var params historyservice.Params
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	expiredAt, err := h.pages.ExpiredAt(ctx, id)
	if err != nil {
		h.writeInternalError(w, r, err)
		return
	}

	feed, err := h.service.List(ctx, id, params.Query(), expiredAt)
	if err != nil {
		h.writeInternalError(w, r, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, feed)
}

func (h *Handler) writeInternalError(w http.ResponseWriter, r *http.Request, err error) {
	h.logger.ErrorContext(r.Context(), "page history", "error", err)
	httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
}
