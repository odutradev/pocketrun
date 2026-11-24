package page

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/domains/group/handlers/group"
	"pocketrun-api/internal/domains/user/middlewares/managerauth"
	"pocketrun-api/internal/services/activation"
	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/services/slug"
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
	mux.Handle("GET /pages/list", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("GET /pages/summary/details", authenticate(http.HandlerFunc(h.summary)))
	mux.Handle("GET /pages/slug-availability/check", authenticate(http.HandlerFunc(h.checkSlug)))
	mux.Handle("POST /pages/create", authenticate(http.HandlerFunc(h.create)))
	mux.Handle("GET /pages/{id}/details", authenticate(http.HandlerFunc(h.getByID)))
	mux.Handle("PATCH /pages/{id}/update", authenticate(http.HandlerFunc(h.update)))
	mux.Handle("PATCH /pages/{id}/status/set", authenticate(http.HandlerFunc(h.setStatus)))
	mux.Handle("DELETE /pages/{id}/delete", authenticate(http.HandlerFunc(h.delete)))
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	var params ListParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	page, err := h.service.List(r.Context(), params.Query())
	if err != nil {
		h.writeError(w, r, "list pages", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, page)
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.service.Summary(r.Context())
	if err != nil {
		h.writeError(w, r, "summarize pages", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, summary)
}

func (h *Handler) checkSlug(w http.ResponseWriter, r *http.Request) {
	var params SlugCheckParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	availability, err := h.service.CheckSlug(r.Context(), params.Slug, params.OwnerID())
	if err != nil {
		h.writeError(w, r, "check page slug", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, availability)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input Input
	if err := httpx.DecodeLimited(w, r, h.validate, &input, MaxBodyBytes); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	page, err := h.service.Create(ctx, managerID, input)
	if err != nil {
		h.writeError(w, r, "create page", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, page)
}

func (h *Handler) getByID(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "get page", err)
		return
	}

	page, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		h.writeError(w, r, "get page", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, page)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "update page", err)
		return
	}

	var input Input
	if err := httpx.DecodeLimited(w, r, h.validate, &input, MaxBodyBytes); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	page, err := h.service.Update(r.Context(), id, input)
	if err != nil {
		h.writeError(w, r, "update page", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, page)
}

func (h *Handler) setStatus(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "set page status", err)
		return
	}

	var input StatusInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	page, err := h.service.SetStatus(r.Context(), id, *input.IsActive)
	if err != nil {
		h.writeError(w, r, "set page status", err)
		return
	}
	page.HTML = ""
	httpx.WriteJSON(w, http.StatusOK, page)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "delete page", err)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		h.writeError(w, r, "delete page", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Page deleted successfully")
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidPageID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_page_id")
	case errors.Is(err, group.ErrInvalidGroupID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_group_id")
	case errors.Is(err, ErrPageTooLarge):
		httpx.WriteError(w, http.StatusRequestEntityTooLarge, "page_too_large")
	case errors.Is(err, activation.ErrInvalidSchedule):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_schedule")
	case errors.Is(err, slug.ErrInvalidSlug):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_slug")
	case errors.Is(err, slug.ErrReservedSlug):
		httpx.WriteError(w, http.StatusBadRequest, "reserved_slug")
	case errors.Is(err, ErrPageNotFound):
		httpx.WriteError(w, http.StatusNotFound, "page_not_found")
	case errors.Is(err, group.ErrGroupNotFound):
		httpx.WriteError(w, http.StatusNotFound, "group_not_found")
	case errors.Is(err, slug.ErrSlugTaken):
		httpx.WriteError(w, http.StatusConflict, "slug_taken")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
