package page

import (
	"errors"
	"html"
	"net/http"
	"net/url"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/platform/traffic"
)

const (
	unavailableHeading = "Página indisponível"
	unavailableMessage = "Esta página não existe, foi desativada ou já expirou. Confira o endereço com quem o enviou."
)

func render(page Page) string {
	lower := strings.ToLower(page.HTML)
	if strings.Contains(lower, "<html") || strings.Contains(lower, "<!doctype") {
		return page.HTML
	}

	var builder strings.Builder
	builder.WriteString("<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n")
	builder.WriteString("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>")
	builder.WriteString(html.EscapeString(page.Title))
	builder.WriteString("</title>\n</head>\n<body>\n")
	builder.WriteString(page.HTML)
	builder.WriteString("\n</body>\n</html>\n")
	return builder.String()
}

func (h *Handler) ServePage(w http.ResponseWriter, r *http.Request, id bson.ObjectID) {
	if !h.isPagesHost(r) {
		h.writeUnavailable(w, r)
		return
	}

	page, err := h.service.Open(r.Context(), id, traffic.VisitFromRequest(r))
	if errors.Is(err, ErrPageNotFound) || errors.Is(err, ErrPageUnavailable) {
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
	if _, err := w.Write([]byte(render(*page))); err != nil {
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
