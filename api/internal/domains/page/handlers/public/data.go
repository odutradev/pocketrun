package public

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/page/handlers/access"
	"pocketrun-api/internal/domains/page/handlers/binding"
	"pocketrun-api/internal/domains/page/handlers/page"
	"pocketrun-api/internal/services/httpx"
	"pocketrun-api/internal/utils"
)

const (
	dataHeader = "X-Pocketrun-Page"

	visitorDataLimit = 120
	pageDataLimit    = 1200
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

func (h *Handler) runtimeExtra(ctx context.Context, id bson.ObjectID, decision access.Decision) runtimeExtra {
	extra := runtimeExtra{Access: runtimeAccess{IsProtected: decision.IsProtected}}
	if decision.IsProtected {
		role := decision.Role
		extra.Access.Role = &role
	}

	described, err := h.data.Describe(ctx, id, binding.Subject{IsProtected: decision.IsProtected, PageRole: decision.Role})
	if err != nil {
		h.logger.WarnContext(ctx, "describe page kv", "pageId", id.Hex(), "error", err)
		return extra
	}
	extra.KV = described
	return extra
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
