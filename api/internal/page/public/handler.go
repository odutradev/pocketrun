package public

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/page/access"
	"pocketrun-api/internal/page/page"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/platform/traffic"
)

const (
	unavailableHeading = "Página indisponível"
	unavailableMessage = "Esta página não existe, foi desativada ou já expirou. Confira o endereço com quem o enviou."
)

const cookiePrefix = "pocketrun_page_"

type PageOpener interface {
	Visible(ctx context.Context, id bson.ObjectID) (*page.Page, error)
	Open(ctx context.Context, id bson.ObjectID, visit traffic.Visit) (*page.Page, error)
}

type AccessGuard interface {
	Allow(ctx context.Context, pageID bson.ObjectID, token string) (access.Decision, error)
	Unlock(ctx context.Context, pageID bson.ObjectID, pin, client string) (access.Grant, error)
}

type Handler struct {
	pages     PageOpener
	guard     AccessGuard
	pagesHost string
	logger    *slog.Logger
}

func NewHandler(pages PageOpener, guard AccessGuard, pagesURL string, logger *slog.Logger) *Handler {
	return &Handler{pages: pages, guard: guard, pagesHost: urlHost(pagesURL), logger: logger}
}

func (h *Handler) ServePage(w http.ResponseWriter, r *http.Request, id bson.ObjectID) {
	ctx := r.Context()
	if !h.isPagesHost(r) {
		h.writeUnavailable(w, r)
		return
	}

	decision, err := h.guard.Allow(ctx, id, sessionToken(r, id))
	if err != nil {
		h.writeInternalError(w, r, "check page access", err)
		return
	}
	if !decision.IsAllowed {
		h.serveGate(w, r, id, http.StatusOK, "")
		return
	}

	opened, err := h.pages.Open(ctx, id, traffic.VisitFromRequest(r))
	if errors.Is(err, page.ErrPageNotFound) || errors.Is(err, page.ErrPageUnavailable) {
		h.writeUnavailable(w, r)
		return
	}
	if err != nil {
		h.writeInternalError(w, r, "open page", err)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	if decision.IsProtected {
		setPrivateHeaders(w)
	}
	w.WriteHeader(http.StatusOK)
	if r.Method == http.MethodHead {
		return
	}
	if _, err := w.Write([]byte(render(*opened))); err != nil {
		h.logger.WarnContext(r.Context(), "write page", "error", err)
	}
}

func (h *Handler) UnlockPage(w http.ResponseWriter, r *http.Request, id bson.ObjectID) {
	ctx := r.Context()
	if !h.isPagesHost(r) {
		h.writeUnavailable(w, r)
		return
	}

	target, err := h.pages.Visible(ctx, id)
	if errors.Is(err, page.ErrPageNotFound) || errors.Is(err, page.ErrPageUnavailable) {
		h.writeUnavailable(w, r)
		return
	}
	if err != nil {
		h.writeInternalError(w, r, "unlock page", err)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, access.MaxFormBytes)
	if err := r.ParseForm(); err != nil {
		h.serveGate(w, r, id, http.StatusBadRequest, gateInvalidPIN)
		return
	}

	grant, err := h.guard.Unlock(ctx, id, strings.TrimSpace(r.PostFormValue("pin")), proxyClientIP(r))
	switch {
	case errors.Is(err, access.ErrNotProtected):
		h.redirectBack(w, r)
	case errors.Is(err, access.ErrInvalidPIN):
		h.serveGate(w, r, id, http.StatusBadRequest, gateInvalidPIN)
	case errors.Is(err, access.ErrWrongPIN):
		h.serveGate(w, r, id, http.StatusUnauthorized, gateWrongPIN)
	case errors.Is(err, access.ErrTooManyAttempts):
		w.Header().Set("Retry-After", "900")
		h.serveGate(w, r, id, http.StatusTooManyRequests, gateTooMany)
	case err != nil:
		h.writeInternalError(w, r, "unlock page", err)
	default:
		http.SetCookie(w, &http.Cookie{
			Name:     cookiePrefix + id.Hex(),
			Value:    grant.Token,
			Path:     "/" + target.Slug,
			Expires:  grant.ExpiresAt,
			MaxAge:   int(access.SessionDuration.Seconds()),
			HttpOnly: true,
			Secure:   isSecure(r),
			SameSite: http.SameSiteLaxMode,
		})
		h.redirectBack(w, r)
	}
}

func (h *Handler) serveGate(w http.ResponseWriter, r *http.Request, id bson.ObjectID, status int, problem string) {
	if _, err := h.pages.Visible(r.Context(), id); err != nil {
		if errors.Is(err, page.ErrPageNotFound) || errors.Is(err, page.ErrPageUnavailable) {
			h.writeUnavailable(w, r)
			return
		}
		h.writeInternalError(w, r, "show page gate", err)
		return
	}
	if err := writeGate(w, r, status, problem); err != nil {
		h.logger.WarnContext(r.Context(), "write page gate", "error", err)
	}
}

func (h *Handler) redirectBack(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	http.Redirect(w, r, r.URL.RequestURI(), http.StatusSeeOther)
}

func (h *Handler) writeInternalError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	h.logger.ErrorContext(r.Context(), operation, "error", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

func sessionToken(r *http.Request, id bson.ObjectID) string {
	cookie, err := r.Cookie(cookiePrefix + id.Hex())
	if err != nil {
		return ""
	}
	return cookie.Value
}

func proxyClientIP(r *http.Request) string {
	hops := strings.Split(r.Header.Get("X-Forwarded-For"), ",")
	if last := strings.TrimSpace(hops[len(hops)-1]); last != "" {
		return last
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func isSecure(r *http.Request) bool {
	return r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
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
