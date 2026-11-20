package public

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/url"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/link/link"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/platform/traffic"
	"pocketrun-api/internal/slug"
)

const (
	unavailableHeading = "Link indisponível"
	unavailableMessage = "Este endereço não existe, foi desativado ou já expirou. Confira o link com quem o enviou."
)

type LinkOpener interface {
	Resolve(ctx context.Context, value string) (*slug.Entry, error)
	Open(ctx context.Context, value string, visit traffic.Visit) (*link.Link, error)
}

type PageServer interface {
	ServePage(w http.ResponseWriter, r *http.Request, id bson.ObjectID)
	UnlockPage(w http.ResponseWriter, r *http.Request, id bson.ObjectID)
	ServeData(w http.ResponseWriter, r *http.Request, id bson.ObjectID, rest string)
	WriteDataError(w http.ResponseWriter, status int, code string)
}

type Handler struct {
	links  LinkOpener
	pages  PageServer
	logger *slog.Logger
}

func NewHandler(links LinkOpener, pages PageServer, logger *slog.Logger) *Handler {
	return &Handler{links: links, pages: pages, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /{slug}", h.open)
	mux.HandleFunc("GET /{slug}/{$}", h.open)
	mux.HandleFunc("POST /{slug}", h.unlock)
	mux.HandleFunc("POST /{slug}/{$}", h.unlock)
	mux.HandleFunc("/{slug}/_/kv/{rest...}", h.data)
}

func (h *Handler) data(w http.ResponseWriter, r *http.Request) {
	entry, err := h.links.Resolve(r.Context(), r.PathValue("slug"))
	if errors.Is(err, link.ErrLinkNotFound) {
		h.pages.WriteDataError(w, http.StatusNotFound, "page_not_found")
		return
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "resolve slug", "error", err)
		h.pages.WriteDataError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	if entry.Kind != slug.KindPage {
		h.pages.WriteDataError(w, http.StatusNotFound, "page_not_found")
		return
	}
	h.pages.ServeData(w, r, entry.TargetID, r.PathValue("rest"))
}

func (h *Handler) unlock(w http.ResponseWriter, r *http.Request) {
	entry, err := h.links.Resolve(r.Context(), r.PathValue("slug"))
	if errors.Is(err, link.ErrLinkNotFound) {
		h.writeNotFoundPage(w, r)
		return
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "resolve slug", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	if entry.Kind != slug.KindPage {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	h.pages.UnlockPage(w, r, entry.TargetID)
}

func (h *Handler) open(w http.ResponseWriter, r *http.Request) {
	opened, err := h.links.Open(r.Context(), r.PathValue("slug"), traffic.VisitFromRequest(r))
	var kindError *link.KindError
	if errors.As(err, &kindError) && kindError.Kind == slug.KindPage {
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
	http.Redirect(w, r, withQuery(opened.URL, r.URL.Query()), http.StatusFound)
}

func (h *Handler) writeNotFoundPage(w http.ResponseWriter, r *http.Request) {
	if err := httpx.WriteUnavailablePage(w, unavailableHeading, unavailableMessage); err != nil {
		h.logger.WarnContext(r.Context(), "write not found page", "error", err)
	}
}

func withQuery(destination string, query url.Values) string {
	if len(query) == 0 {
		return destination
	}

	target, err := url.Parse(destination)
	if err != nil {
		return destination
	}

	values := target.Query()
	extra := url.Values{}
	hasOverlap := false
	for key, items := range query {
		if values.Has(key) {
			values[key] = items
			hasOverlap = true
			continue
		}
		extra[key] = items
	}

	switch {
	case hasOverlap:
		for key, items := range extra {
			values[key] = items
		}
		target.RawQuery = values.Encode()
	case target.RawQuery == "":
		target.RawQuery = extra.Encode()
	default:
		target.RawQuery = target.RawQuery + "&" + extra.Encode()
	}
	return target.String()
}
