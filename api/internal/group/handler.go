package group

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

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

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler, prefix string, kind Kind, members Detacher) {
	mux.Handle("GET "+prefix+"/list", authenticate(h.list(kind)))
	mux.Handle("POST "+prefix+"/create", authenticate(h.create(kind)))
	mux.Handle("PATCH "+prefix+"/{id}/update", authenticate(h.update(kind)))
	mux.Handle("DELETE "+prefix+"/{id}/delete", authenticate(h.delete(kind, members)))
}

func (h *Handler) list(kind Kind) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		groups, err := h.service.List(r.Context(), kind)
		if err != nil {
			h.writeError(w, r, "list groups", err)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, groups)
	}
}

func (h *Handler) create(kind Kind) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input Input
		if err := httpx.Decode(w, r, h.validate, &input); err != nil {
			httpx.WriteDecodeError(w, err)
			return
		}

		group, err := h.service.Create(r.Context(), kind, input)
		if err != nil {
			h.writeError(w, r, "create group", err)
			return
		}
		httpx.WriteJSON(w, http.StatusCreated, group)
	}
}

func (h *Handler) update(kind Kind) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := ParseID(r.PathValue("id"))
		if err != nil {
			h.writeError(w, r, "update group", err)
			return
		}

		var input Input
		if err := httpx.Decode(w, r, h.validate, &input); err != nil {
			httpx.WriteDecodeError(w, err)
			return
		}

		group, err := h.service.Update(r.Context(), kind, id, input)
		if err != nil {
			h.writeError(w, r, "update group", err)
			return
		}
		httpx.WriteJSON(w, http.StatusOK, group)
	}
}

func (h *Handler) delete(kind Kind, members Detacher) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := ParseID(r.PathValue("id"))
		if err != nil {
			h.writeError(w, r, "delete group", err)
			return
		}

		if err := h.service.Delete(r.Context(), kind, id, members); err != nil {
			h.writeError(w, r, "delete group", err)
			return
		}
		httpx.WriteMessage(w, http.StatusOK, "Group deleted successfully")
	}
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, ErrInvalidGroupID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_group_id")
	case errors.Is(err, ErrGroupNotFound):
		httpx.WriteError(w, http.StatusNotFound, "group_not_found")
	case errors.Is(err, ErrGroupNameTaken):
		httpx.WriteError(w, http.StatusConflict, "group_name_taken")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}
