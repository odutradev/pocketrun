package link

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/group"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/slug"
	"pocketrun-api/internal/user"
)

type Handler struct {
	service  *Service
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *Service, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, validate: validate, logger: logger}
}

func (h *Handler) RegisterAdmin(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /links/list", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("GET /links/summary/details", authenticate(http.HandlerFunc(h.summary)))
	mux.Handle("GET /links/slug-availability/check", authenticate(http.HandlerFunc(h.checkSlug)))
	mux.Handle("POST /links/create", authenticate(http.HandlerFunc(h.create)))
	mux.Handle("GET /links/{id}/details", authenticate(http.HandlerFunc(h.getByID)))
	mux.Handle("PATCH /links/{id}/update", authenticate(http.HandlerFunc(h.update)))
	mux.Handle("DELETE /links/{id}/delete", authenticate(http.HandlerFunc(h.delete)))
	mux.Handle("GET /links/{id}/history/list", authenticate(http.HandlerFunc(h.history)))
	mux.Handle("GET /links/{id}/analytics/details", authenticate(http.HandlerFunc(h.analytics)))
}

func (h *Handler) RegisterPublic(mux *http.ServeMux) {
	mux.HandleFunc("GET /{slug}", h.open)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	var params ListParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	page, err := h.service.List(r.Context(), params.Query())
	if err != nil {
		h.writeError(w, r, "list links", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, page)
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.service.Summary(r.Context())
	if err != nil {
		h.writeError(w, r, "summarize links", err)
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
		h.writeError(w, r, "check link slug", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, availability)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input Input
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	link, err := h.service.Create(ctx, managerID, input)
	if err != nil {
		h.writeError(w, r, "create link", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, link)
}

func (h *Handler) getByID(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "get link", err)
		return
	}

	link, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		h.writeError(w, r, "get link", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, link)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "update link", err)
		return
	}

	var input Input
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	link, err := h.service.Update(r.Context(), id, input)
	if err != nil {
		h.writeError(w, r, "update link", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, link)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "delete link", err)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		h.writeError(w, r, "delete link", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Link deleted successfully")
}

func (h *Handler) history(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "link history", err)
		return
	}

	var params HistoryParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	page, err := h.service.History(r.Context(), id, params.Query())
	if err != nil {
		h.writeError(w, r, "link history", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, page)
}

func (h *Handler) analytics(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "link analytics", err)
		return
	}

	var params AnalyticsParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	analytics, err := h.service.Analytics(r.Context(), id, params.Query())
	if err != nil {
		h.writeError(w, r, "link analytics", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, analytics)
}

func (h *Handler) open(w http.ResponseWriter, r *http.Request) {
	link, err := h.service.Open(r.Context(), r.PathValue("slug"), VisitFromRequest(r))
	if errors.Is(err, ErrLinkNotFound) || errors.Is(err, ErrLinkUnavailable) {
		http.NotFound(w, r)
		return
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "open link", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	http.Redirect(w, r, link.URL, http.StatusFound)
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidLinkID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_link_id")
	case errors.Is(err, group.ErrInvalidGroupID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_group_id")
	case errors.Is(err, ErrInvalidSchedule):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_schedule")
	case errors.Is(err, slug.ErrInvalidSlug):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_slug")
	case errors.Is(err, slug.ErrReservedSlug):
		httpx.WriteError(w, http.StatusBadRequest, "reserved_slug")
	case errors.Is(err, ErrLinkNotFound):
		httpx.WriteError(w, http.StatusNotFound, "link_not_found")
	case errors.Is(err, group.ErrGroupNotFound):
		httpx.WriteError(w, http.StatusNotFound, "group_not_found")
	case errors.Is(err, slug.ErrSlugTaken):
		httpx.WriteError(w, http.StatusConflict, "slug_taken")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
