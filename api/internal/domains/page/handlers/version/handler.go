package version

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/services/httpx"
)

type PageChecker interface {
	Exists(ctx context.Context, id bson.ObjectID) (bool, error)
}

type Handler struct {
	service *Service
	pages   PageChecker
	logger  *slog.Logger
}

func NewHandler(service *Service, pages PageChecker, logger *slog.Logger) *Handler {
	return &Handler{service: service, pages: pages, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /pages/{id}/versions/list", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("GET /pages/{id}/versions/{number}/details", authenticate(http.HandlerFunc(h.details)))
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_page_id")
		return
	}

	exists, err := h.pages.Exists(ctx, id)
	if err != nil {
		h.writeError(w, r, "page versions", err)
		return
	}
	if !exists {
		httpx.WriteError(w, http.StatusNotFound, "page_not_found")
		return
	}

	versions, err := h.service.List(ctx, id)
	if err != nil {
		h.writeError(w, r, "page versions", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, versions)
}

func (h *Handler) details(w http.ResponseWriter, r *http.Request) {
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_page_id")
		return
	}

	number, err := ParseNumber(r.PathValue("number"))
	if err != nil {
		h.writeError(w, r, "page version", err)
		return
	}

	version, err := h.service.Get(r.Context(), id, number)
	if err != nil {
		h.writeError(w, r, "page version", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, version)
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidVersion):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_version")
	case errors.Is(err, ErrVersionNotFound):
		httpx.WriteError(w, http.StatusNotFound, "version_not_found")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
