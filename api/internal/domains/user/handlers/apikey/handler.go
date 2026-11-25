package apikey

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/user/middlewares/managerauth"
	"pocketrun-api/internal/services/httpx"
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
	mux.Handle("GET /auth/api-keys/list", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("POST /auth/api-keys/create", authenticate(http.HandlerFunc(h.create)))
	mux.Handle("DELETE /auth/api-keys/{id}/delete", authenticate(http.HandlerFunc(h.delete)))
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	keys, err := h.service.List(ctx, userID)
	if err != nil {
		h.writeError(ctx, w, "list api keys", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, keys)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input CreateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	created, err := h.service.Create(ctx, userID, input)
	if err != nil {
		h.writeError(ctx, w, "create api key", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, created)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(ctx, w, "delete api key", err)
		return
	}

	if err := h.service.Delete(ctx, userID, id); err != nil {
		h.writeError(ctx, w, "delete api key", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) writeError(ctx context.Context, w http.ResponseWriter, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidUserID):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
	case errors.Is(err, ErrInvalidKeyID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_api_key_id")
	case errors.Is(err, ErrKeyNotFound):
		httpx.WriteError(w, http.StatusNotFound, "api_key_not_found")
	case errors.Is(err, ErrTooManyKeys):
		httpx.WriteError(w, http.StatusConflict, "too_many_api_keys")
	default:
		h.logger.ErrorContext(ctx, operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}

func parseIDs(r *http.Request) (bson.ObjectID, bson.ObjectID, error) {
	userID, err := managerauth.ManagerIDFromContext(r.Context())
	if err != nil {
		return bson.ObjectID{}, bson.ObjectID{}, fmt.Errorf("parse user id: %w", ErrInvalidUserID)
	}

	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		return bson.ObjectID{}, bson.ObjectID{}, err
	}
	return userID, id, nil
}
