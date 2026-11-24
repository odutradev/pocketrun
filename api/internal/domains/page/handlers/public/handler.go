package public

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/page/handlers/access"
	"pocketrun-api/internal/domains/page/handlers/binding"
	"pocketrun-api/internal/domains/page/handlers/page"
	"pocketrun-api/internal/domains/page/utils/pagegate"
	"pocketrun-api/internal/domains/page/utils/pinsecret"
	pagerepository "pocketrun-api/internal/repositories/page"
	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/services/ratelimit"
	"pocketrun-api/internal/services/traffic"
	"pocketrun-api/internal/utils"
)

func (h *Handler) ServeData(w http.ResponseWriter, r *http.Request, id bson.ObjectID, rest string) {
	ctx := r.Context()
	w.Header().Del("Access-Control-Allow-Origin")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	if !h.isPagesHost(r) {
		h.WriteDataError(w, http.StatusNotFound, "page_not_found")
		return
	}
	if !isSameOriginCall(r) {
		h.WriteDataError(w, http.StatusForbidden, "invalid_client")
		return
	}

	if _, err := h.pages.Visible(ctx, id); err != nil {
		if errors.Is(err, page.ErrPageNotFound) || errors.Is(err, page.ErrPageUnavailable) {
			h.WriteDataError(w, http.StatusNotFound, "page_not_found")
			return
		}
		h.logger.ErrorContext(ctx, "check page for kv", "error", err)
		h.WriteDataError(w, http.StatusInternalServerError, "internal_error")
		return
	}

	decision, err := h.guard.Allow(ctx, id, sessionToken(r, id))
	if err != nil {
		h.logger.ErrorContext(ctx, "check page access for kv", "error", err)
		h.WriteDataError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	if !decision.IsAllowed {
		h.WriteDataError(w, http.StatusUnauthorized, "page_locked")
		return
	}

	now := time.Now()
	if !h.pageLimiter.Allow(id.Hex(), now) || !h.visitorLimiter.Allow(id.Hex()+"|"+proxyClientIP(r), now) {
		w.Header().Set("Retry-After", "60")
		h.WriteDataError(w, http.StatusTooManyRequests, "too_many_requests")
		return
	}

	request, err := binding.ParseRequest(w, r, h.validate, rest)
	if err != nil {
		h.writeDataFailure(w, r, err)
		return
	}

	result, err := h.data.Run(ctx, id, binding.Subject{IsProtected: decision.IsProtected, PageRole: decision.Role}, request)
	if err != nil {
		h.writeDataFailure(w, r, err)
		return
	}
	httpx.WriteJSON(w, result.Status, result.Payload)
}

func (h *Handler) WriteDataError(w http.ResponseWriter, status int, code string) {
	w.Header().Del("Access-Control-Allow-Origin")
	w.Header().Set("Cache-Control", "no-store")
	httpx.WriteError(w, status, code)
}

func (h *Handler) writeDataFailure(w http.ResponseWriter, r *http.Request, err error) {
	var validationError *httpx.ValidationError
	if errors.As(err, &validationError) || errors.Is(err, httpx.ErrInvalidBody) {
		httpx.WriteDecodeError(w, err)
		return
	}
	status, code := binding.ErrorStatus(err)
	if status == http.StatusInternalServerError {
		h.logger.ErrorContext(r.Context(), "run page kv", "error", err)
	}
	h.WriteDataError(w, status, code)
}

type PageOpener interface {
	Visible(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error)
	Open(ctx context.Context, id bson.ObjectID, visit traffic.Visit) (*pagerepository.Page, error)
}

type AccessGuard interface {
	Allow(ctx context.Context, pageID bson.ObjectID, token string) (access.Decision, error)
	Unlock(ctx context.Context, pageID bson.ObjectID, pin, client string) (access.Grant, error)
}

type DataBridge interface {
	Describe(ctx context.Context, pageID bson.ObjectID, subject binding.Subject) (*binding.Runtime, error)
	Run(ctx context.Context, pageID bson.ObjectID, subject binding.Subject, request binding.Request) (binding.Result, error)
}

type Handler struct {
	service        *Service
	pages          PageOpener
	guard          AccessGuard
	data           DataBridge
	pagesHost      string
	validate       *validator.Validate
	visitorLimiter *ratelimit.Limiter
	pageLimiter    *ratelimit.Limiter
	logger         *slog.Logger
}

func NewHandler(dependencies Dependencies) *Handler {
	return &Handler{
		service:        NewService(dependencies.Data, dependencies.Logger),
		pages:          dependencies.Pages,
		guard:          dependencies.Guard,
		data:           dependencies.Data,
		pagesHost:      utils.URLHost(dependencies.PagesURL),
		validate:       dependencies.Validate,
		visitorLimiter: ratelimit.New(time.Minute, visitorDataLimit),
		pageLimiter:    ratelimit.New(time.Minute, pageDataLimit),
		logger:         dependencies.Logger,
	}
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

	body, err := h.service.Render(ctx, *opened, decision)
	if err != nil {
		h.writeInternalError(w, r, "render page", err)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	if decision.IsProtected {
		pagegate.SetPrivateHeaders(w)
	}
	w.WriteHeader(http.StatusOK)
	if r.Method == http.MethodHead {
		return
	}
	if _, err := w.Write([]byte(body)); err != nil {
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
		h.serveGate(w, r, id, http.StatusBadRequest, pagegate.MessageInvalidPIN)
		return
	}

	grant, err := h.guard.Unlock(ctx, id, strings.TrimSpace(r.PostFormValue("pin")), proxyClientIP(r))
	switch {
	case errors.Is(err, access.ErrNotProtected):
		h.redirectBack(w, r)
	case errors.Is(err, pinsecret.ErrInvalidPIN):
		h.serveGate(w, r, id, http.StatusBadRequest, pagegate.MessageInvalidPIN)
	case errors.Is(err, access.ErrWrongPIN):
		h.serveGate(w, r, id, http.StatusUnauthorized, pagegate.MessageWrongPIN)
	case errors.Is(err, access.ErrTooManyAttempts):
		w.Header().Set("Retry-After", "900")
		h.serveGate(w, r, id, http.StatusTooManyRequests, pagegate.MessageTooMany)
	case err != nil:
		h.writeInternalError(w, r, "unlock page", err)
	default:
		http.SetCookie(w, &http.Cookie{
			Name:     cookiePrefix + id.Hex(),
			Value:    grant.Token,
			Path:     "/" + target.Slug,
			Expires:  grant.ExpiresAt,
			MaxAge:   int(time.Until(grant.ExpiresAt).Seconds()),
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
	if err := pagegate.Write(w, r, status, problem); err != nil {
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

	return utils.HasHost(r, h.pagesHost)
}

func (h *Handler) writeUnavailable(w http.ResponseWriter, r *http.Request) {
	if err := httpx.WriteUnavailablePage(w, unavailableHeading, unavailableMessage); err != nil {
		h.logger.WarnContext(r.Context(), "write page unavailable", "error", err)
	}
}

func isSameOriginCall(r *http.Request) bool {
	if r.Header.Get(dataHeader) != "1" {
		return false
	}
	if site := r.Header.Get("Sec-Fetch-Site"); site != "" && site != "same-origin" {
		return false
	}
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	host := utils.URLHost(origin)
	if strings.EqualFold(host, r.Host) {
		return true
	}
	for _, forwarded := range strings.Split(r.Header.Get("X-Forwarded-Host"), ",") {
		if strings.EqualFold(host, strings.TrimSpace(forwarded)) {
			return true
		}
	}
	return false
}
