package backup

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/platform/httpx"
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

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /backup/summary/details", authenticate(http.HandlerFunc(h.summary)))
	mux.Handle("GET /backup/export", authenticate(http.HandlerFunc(h.export)))
	mux.Handle("POST /backup/restore", authenticate(http.HandlerFunc(h.restore)))
}

func (h *Handler) summary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	summary, err := h.service.Summary(ctx, managerID)
	if err != nil {
		h.writeServiceError(ctx, w, "backup summary", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, summary)
}

func (h *Handler) export(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var query ExportQuery
	if err := httpx.DecodeQuery(r, h.validate, &query); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}
	if err := h.service.Authorize(ctx, managerID); err != nil {
		h.writeServiceError(ctx, w, "authorize backup export", err)
		return
	}

	extendDeadlines(ctx, h.logger, w)
	w.Header().Set("Content-Type", "application/gzip")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="pocketrun-backup-%s.jsonl.gz"`, time.Now().UTC().Format("20060102-1504")))
	if err := h.service.Export(ctx, managerID, query.Scope, w); err != nil {
		h.logger.ErrorContext(ctx, "export backup", "error", err)
	}
}

func (h *Handler) restore(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	extendDeadlines(ctx, h.logger, w)
	result, err := h.service.Restore(ctx, managerID, http.MaxBytesReader(w, r.Body, MaxRestoreBytes))
	if err != nil {
		h.writeServiceError(ctx, w, "restore backup", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, result)
}

func (h *Handler) writeServiceError(ctx context.Context, w http.ResponseWriter, operation string, err error) {
	var tooLarge *http.MaxBytesError
	switch {
	case errors.Is(err, user.ErrForbidden):
		httpx.WriteError(w, http.StatusForbidden, "forbidden")
	case errors.Is(err, user.ErrUserNotFound), errors.Is(err, user.ErrInvalidToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
	case errors.As(err, &tooLarge):
		httpx.WriteError(w, http.StatusRequestEntityTooLarge, "backup_too_large")
	case errors.Is(err, ErrRestoreRunning):
		httpx.WriteError(w, http.StatusConflict, "restore_running")
	case errors.Is(err, ErrUnsupportedFormat):
		httpx.WriteError(w, http.StatusBadRequest, "backup_unsupported_version")
	case errors.Is(err, ErrTruncatedFile):
		httpx.WriteError(w, http.StatusBadRequest, "backup_truncated")
	case errors.Is(err, ErrMissingSuperadmin):
		httpx.WriteError(w, http.StatusBadRequest, "backup_missing_superadmin")
	case errors.Is(err, ErrInvalidFile):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_backup")
	default:
		h.logger.ErrorContext(ctx, operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}

func extendDeadlines(ctx context.Context, logger *slog.Logger, w http.ResponseWriter) {
	controller := http.NewResponseController(w)
	deadline := time.Now().Add(TransferTimeout)
	if err := controller.SetReadDeadline(deadline); err != nil {
		logger.WarnContext(ctx, "extend backup read deadline", "error", err)
	}
	if err := controller.SetWriteDeadline(deadline); err != nil {
		logger.WarnContext(ctx, "extend backup write deadline", "error", err)
	}
}
