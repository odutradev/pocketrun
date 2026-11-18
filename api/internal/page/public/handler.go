package public

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/page/page"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/platform/traffic"
)

const (
	unavailableHeading = "Página indisponível"
	unavailableMessage = "Esta página não existe, foi desativada ou já expirou. Confira o endereço com quem o enviou."
)

type PageOpener interface {
	Open(ctx context.Context, id bson.ObjectID, visit traffic.Visit) (*page.Page, error)
}

type Handler struct {
	pages     PageOpener
	pagesHost string
	logger    *slog.Logger
}

func NewHandler(pages PageOpener, pagesURL string, logger *slog.Logger) *Handler {
	return &Handler{pages: pages, pagesHost: urlHost(pagesURL), logger: logger}
}

func (h *Handler) ServePage(w http.ResponseWriter, r *http.Request, id bson.ObjectID) {
	if !h.isPagesHost(r) {
		h.writeUnavailable(w, r)
		return
	}

	opened, err := h.pages.Open(r.Context(), id, traffic.VisitFromRequest(r))
	if errors.Is(err, page.ErrPageNotFound) || errors.Is(err, page.ErrPageUnavailable) {
		h.writeUnavailable(w, r)
		return
	}
	if err != nil {
		h.logger.ErrorContext(r.Context(), "open page", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	w.WriteHeader(http.StatusOK)
	if r.Method == http.MethodHead {
		return
	}
	if _, err := w.Write([]byte(render(*opened))); err != nil {
		h.logger.WarnContext(r.Context(), "write page", "error", err)
	}
}

func (h *Handler) isPagesHost(r *http.Request) bool {
	if h.pagesHost == "" {
		return true
	}

	hosts := []string{r.Host}
	for _, host := range strings.Split(r.Header.Get("X-Forwarded-Host"), ",") {
		hosts = append(hosts, strings.TrimSpace(host))
	}
	for _, host := range hosts {
		if strings.EqualFold(host, h.pagesHost) {
			return true
		}
	}
	return false
}

func (h *Handler) writeUnavailable(w http.ResponseWriter, r *http.Request) {
	if err := httpx.WriteUnavailablePage(w, unavailableHeading, unavailableMessage); err != nil {
		h.logger.WarnContext(r.Context(), "write page unavailable", "error", err)
	}
}

func urlHost(raw string) string {
	parsed, err := url.Parse(strings.TrimSpace(raw))
	if err != nil {
		return ""
	}
	return parsed.Host
}
