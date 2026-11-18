package access

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/httpx"
)

type PageChecker interface {
	Exists(ctx context.Context, id bson.ObjectID) (bool, error)
}

type Handler struct {
	service  *Service
	pages    PageChecker
	validate *validator.Validate
	logger   *slog.Logger
}

func NewHandler(service *Service, pages PageChecker, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, pages: pages, validate: validate, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /pages/{id}/access/details", authenticate(http.HandlerFunc(h.details)))
	mux.Handle("PATCH /pages/{id}/access/status/set", authenticate(http.HandlerFunc(h.update)))
	mux.Handle("PATCH /pages/{id}/access/session/set", authenticate(http.HandlerFunc(h.setSession)))
	mux.Handle("POST /pages/{id}/access/sessions/revoke", authenticate(http.HandlerFunc(h.revoke)))
	mux.Handle("POST /pages/{id}/access/keys/create", authenticate(http.HandlerFunc(h.createKey)))
	mux.Handle("PATCH /pages/{id}/access/keys/{keyId}/update", authenticate(http.HandlerFunc(h.renameKey)))
	mux.Handle("POST /pages/{id}/access/keys/{keyId}/pin/reset", authenticate(http.HandlerFunc(h.resetPIN)))
	mux.Handle("DELETE /pages/{id}/access/keys/{keyId}/remove", authenticate(http.HandlerFunc(h.removeKey)))
}

func (h *Handler) details(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	access, err := h.service.Get(r.Context(), pageID)
	if err != nil {
		h.writeError(w, r, "get page access", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, access)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	var input StatusInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	access, err := h.service.SetEnabled(r.Context(), pageID, *input.IsEnabled)
	if err != nil {
		h.writeError(w, r, "update page access", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, access)
}

func (h *Handler) setSession(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	var input SessionInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	access, err := h.service.SetSessionHours(r.Context(), pageID, *input.SessionHours)
	if err != nil {
		h.writeError(w, r, "set page access session", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, access)
}

func (h *Handler) revoke(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	access, err := h.service.RevokeSessions(r.Context(), pageID)
	if err != nil {
		h.writeError(w, r, "revoke page access sessions", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, access)
}

func (h *Handler) createKey(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	var input KeyInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	issued, err := h.service.CreateKey(r.Context(), pageID, input)
	if err != nil {
		h.writeError(w, r, "create page access key", err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	httpx.WriteJSON(w, http.StatusCreated, issued)
}

func (h *Handler) renameKey(w http.ResponseWriter, r *http.Request) {
	pageID, keyID, ok := h.keyIDs(w, r)
	if !ok {
		return
	}

	var input RoleInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	access, err := h.service.RenameKey(r.Context(), pageID, keyID, input.Role)
	if err != nil {
		h.writeError(w, r, "rename page access key", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, access)
}

func (h *Handler) resetPIN(w http.ResponseWriter, r *http.Request) {
	pageID, keyID, ok := h.keyIDs(w, r)
	if !ok {
		return
	}

	var input PINInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	issued, err := h.service.ResetPIN(r.Context(), pageID, keyID, input.PIN)
	if err != nil {
		h.writeError(w, r, "reset page access pin", err)
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	httpx.WriteJSON(w, http.StatusOK, issued)
}

func (h *Handler) removeKey(w http.ResponseWriter, r *http.Request) {
	pageID, keyID, ok := h.keyIDs(w, r)
	if !ok {
		return
	}

	access, err := h.service.RemoveKey(r.Context(), pageID, keyID)
	if err != nil {
		h.writeError(w, r, "remove page access key", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, access)
}

func (h *Handler) pageID(w http.ResponseWriter, r *http.Request) (bson.ObjectID, bool) {
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid_page_id")
		return bson.ObjectID{}, false
	}

	exists, err := h.pages.Exists(r.Context(), id)
	if err != nil {
		h.writeError(w, r, "check page", err)
		return bson.ObjectID{}, false
	}
	if !exists {
		httpx.WriteError(w, http.StatusNotFound, "page_not_found")
		return bson.ObjectID{}, false
	}
	return id, true
}

func (h *Handler) keyIDs(w http.ResponseWriter, r *http.Request) (bson.ObjectID, bson.ObjectID, bool) {
	keyID, err := ParseKeyID(r.PathValue("keyId"))
	if err != nil {
		h.writeError(w, r, "parse page access key", err)
		return bson.ObjectID{}, bson.ObjectID{}, false
	}

	pageID, ok := h.pageID(w, r)
	if !ok {
		return bson.ObjectID{}, bson.ObjectID{}, false
	}
	return pageID, keyID, true
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidKeyID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_key_id")
	case errors.Is(err, ErrInvalidPIN):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_pin")
	case errors.Is(err, ErrWeakPIN):
		httpx.WriteError(w, http.StatusBadRequest, "weak_pin")
	case errors.Is(err, ErrInvalidRole):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_role")
	case errors.Is(err, ErrNoKeys):
		httpx.WriteError(w, http.StatusBadRequest, "no_access_keys")
	case errors.Is(err, ErrLastKey):
		httpx.WriteError(w, http.StatusBadRequest, "last_access_key")
	case errors.Is(err, ErrTooManyKeys):
		httpx.WriteError(w, http.StatusBadRequest, "too_many_access_keys")
	case errors.Is(err, ErrKeyNotFound):
		httpx.WriteError(w, http.StatusNotFound, "access_key_not_found")
	case errors.Is(err, ErrPINInUse):
		httpx.WriteError(w, http.StatusConflict, "pin_in_use")
	case errors.Is(err, ErrRoleTaken):
		httpx.WriteError(w, http.StatusConflict, "role_taken")
	case errors.Is(err, ErrAccessConflict):
		httpx.WriteError(w, http.StatusConflict, "access_conflict")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
