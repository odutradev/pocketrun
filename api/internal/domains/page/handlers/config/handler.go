package config

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/kv/handlers/application"
	"pocketrun-api/internal/domains/page/handlers/access"
	"pocketrun-api/internal/domains/page/handlers/binding"
	pagerepository "pocketrun-api/internal/repositories/page"
	"pocketrun-api/internal/services/httpx"
)

type PageFinder interface {
	GetByID(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error)
}

type Handler struct {
	service  *Service
	pages    PageFinder
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *Service, pages PageFinder, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, pages: pages, validate: validate, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /pages/{id}/config/export", authenticate(http.HandlerFunc(h.export)))
	mux.Handle("POST /pages/{id}/config/apply", authenticate(http.HandlerFunc(h.apply)))
}

func (h *Handler) export(w http.ResponseWriter, r *http.Request) {
	current, ok := h.page(w, r)
	if !ok {
		return
	}

	exported, err := h.service.Export(r.Context(), current.ID)
	if err != nil {
		h.writeError(w, r, "export page config", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, exported)
}

func (h *Handler) apply(w http.ResponseWriter, r *http.Request) {
	current, ok := h.page(w, r)
	if !ok {
		return
	}

	var input Input
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	applied, err := h.service.Apply(r.Context(), application.PageInput{PageID: current.ID, Title: current.Title, Slug: current.Slug}, input)
	if err != nil {
		h.writeError(w, r, "apply page config", err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	httpx.WriteJSON(w, http.StatusOK, applied)
}

func (h *Handler) page(w http.ResponseWriter, r *http.Request) (*pagerepository.Page, bool) {
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_page_id")
		return nil, false
	}

	current, err := h.pages.GetByID(r.Context(), id)
	if errors.Is(err, pagerepository.ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "page_not_found")
		return nil, false
	}
	if err != nil {
		h.writeError(w, r, "find page", err)
		return nil, false
	}
	return current, true
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	if status, code, ok := access.ErrorStatus(err); ok {
		httpx.WriteError(w, status, code)
		return
	}
	status, code := binding.ErrorStatus(err)
	if status == http.StatusInternalServerError {
		h.logger.ErrorContext(r.Context(), operation, "error", err)
	}
	httpx.WriteError(w, status, code)
}
