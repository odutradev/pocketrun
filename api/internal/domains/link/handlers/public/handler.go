package public

import (
	"errors"
	"log/slog"
	"net/http"

	"pocketrun-api/internal/domains/link/handlers/link"
	slugrepository "pocketrun-api/internal/repositories/slug"
	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/services/traffic"
)

type Handler struct {
	service *Service
	pages   PageServer
	logger  *slog.Logger
}

func NewHandler(service *Service, pages PageServer, logger *slog.Logger) *Handler {
	return &Handler{service: service, pages: pages, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /{slug}", h.open)
	mux.HandleFunc("GET /{slug}/{$}", h.open)
	mux.HandleFunc("POST /{slug}", h.unlock)
	mux.HandleFunc("POST /{slug}/{$}", h.unlock)
	mux.HandleFunc("/{slug}/_/kv/{rest...}", h.data)
	mux.HandleFunc("POST /{slug}/_/access/logout", h.logout)
	mux.HandleFunc("GET /{$}", h.notFound)
}

func (h *Handler) RegisterOutsideLinksDomain(mux *http.ServeMux) {
	mux.HandleFunc("GET /{$}", h.notFound)
	mux.HandleFunc("GET /{slug}", h.notFound)
	mux.HandleFunc("GET /{slug}/{$}", h.notFound)
}

func (h *Handler) notFound(w http.ResponseWriter, r *http.Request) {
	h.writeNotFoundPage(w, r)
}

func (h *Handler) data(w http.ResponseWriter, r *http.Request) {
	if entry, ok := h.resolvePage(w, r); ok {
		h.pages.ServeData(w, r, entry.TargetID, r.PathValue("rest"))
	}
}

func (h *Handler) logout(w http.ResponseWriter, r *http.Request) {
	if entry, ok := h.resolvePage(w, r); ok {
		h.pages.LockPage(w, r, entry.TargetID)
	}
}

func (h *Handler) resolvePage(w http.ResponseWriter, r *http.Request) (*slugrepository.Entry, bool) {
	entry, err := h.service.Resolve(r.Context(), r.PathValue("slug"))
	if errors.Is(err, link.ErrLinkNotFound) {
		h.pages.WriteDataError(w, http.StatusNotFound, "page_not_found")
		return nil, false
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "resolve slug", "error", err)
		h.pages.WriteDataError(w, http.StatusInternalServerError, "internal_error")
		return nil, false
	}
	if entry.Kind != slugrepository.KindPage {
		h.pages.WriteDataError(w, http.StatusNotFound, "page_not_found")
		return nil, false
	}
	return entry, true
}

func (h *Handler) unlock(w http.ResponseWriter, r *http.Request) {
	entry, err := h.service.Resolve(r.Context(), r.PathValue("slug"))
	if errors.Is(err, link.ErrLinkNotFound) {
		h.writeNotFoundPage(w, r)
		return
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "resolve slug", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	if entry.Kind != slugrepository.KindPage {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	h.pages.UnlockPage(w, r, entry.TargetID)
}

func (h *Handler) open(w http.ResponseWriter, r *http.Request) {
	opened, err := h.service.Open(r.Context(), r.PathValue("slug"), traffic.VisitFromRequest(r))
	var kindError *link.KindError
	if errors.As(err, &kindError) && kindError.Kind == slugrepository.KindPage {
		h.pages.ServePage(w, r, kindError.TargetID)
		return
	}
	if errors.As(err, &kindError) {
		h.writeNotFoundPage(w, r)
		return
	}
	if errors.Is(err, link.ErrLinkNotFound) || errors.Is(err, link.ErrLinkUnavailable) {
		h.writeNotFoundPage(w, r)
		return
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "open link", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Cache-Control", "no-store")
	http.Redirect(w, r, h.service.Destination(opened, r.URL.Query()), http.StatusFound)
}

func (h *Handler) writeNotFoundPage(w http.ResponseWriter, r *http.Request) {
	if err := httpx.WriteUnavailablePage(w, unavailableHeading, unavailableMessage); err != nil {
		h.logger.WarnContext(r.Context(), "write not found page", "error", err)
	}
}
