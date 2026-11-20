package application

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

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

func (h *Handler) RegisterAdmin(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /apps/list", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("POST /apps/create", authenticate(http.HandlerFunc(h.create)))
	mux.Handle("GET /apps/{id}/details", authenticate(http.HandlerFunc(h.getByID)))
	mux.Handle("PATCH /apps/{id}/update", authenticate(http.HandlerFunc(h.update)))
	mux.Handle("DELETE /apps/{id}/delete", authenticate(http.HandlerFunc(h.delete)))
	mux.Handle("POST /apps/{id}/tokens/create", authenticate(http.HandlerFunc(h.createToken)))
	mux.Handle("DELETE /apps/{id}/tokens/{tokenId}/delete", authenticate(http.HandlerFunc(h.revokeToken)))
	mux.Handle("PATCH /apps/{id}/tokens/{tokenId}/role/set", authenticate(http.HandlerFunc(h.setTokenRole)))
	mux.Handle("POST /apps/{id}/roles/create", authenticate(http.HandlerFunc(h.createRole)))
	mux.Handle("PATCH /apps/{id}/roles/{role}/update", authenticate(http.HandlerFunc(h.updateRole)))
	mux.Handle("DELETE /apps/{id}/roles/{role}/delete", authenticate(http.HandlerFunc(h.deleteRole)))
}

func (h *Handler) RegisterPublic(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /validate/control-access", authenticate(http.HandlerFunc(h.validateAccess)))
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	applications, err := h.service.List(ctx, managerID)
	if err != nil {
		h.writeError(w, r, "list applications", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, applications)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
		return
	}

	var input CreateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	created, err := h.service.Create(ctx, managerID, input)
	if err != nil {
		h.writeError(w, r, "create application", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, created)
}

func (h *Handler) getByID(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "get application", err)
		return
	}

	application, err := h.service.GetByID(r.Context(), managerID, id)
	if err != nil {
		h.writeError(w, r, "get application", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, application)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "update application", err)
		return
	}

	var input UpdateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	if err := h.service.Update(r.Context(), managerID, id, input); err != nil {
		h.writeError(w, r, "update application", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Application updated successfully")
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "delete application", err)
		return
	}

	if err := h.service.Delete(r.Context(), managerID, id); err != nil {
		h.writeError(w, r, "delete application", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Application and all associated data deleted successfully")
}

func (h *Handler) createToken(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "create token", err)
		return
	}

	var input CreateTokenInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	created, err := h.service.CreateToken(r.Context(), managerID, id, input)
	if err != nil {
		h.writeError(w, r, "create token", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, created)
}

func (h *Handler) revokeToken(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "revoke token", err)
		return
	}

	if err := h.service.RevokeToken(r.Context(), managerID, id, r.PathValue("tokenId")); err != nil {
		h.writeError(w, r, "revoke token", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Token revoked successfully")
}

func (h *Handler) setTokenRole(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "set token role", err)
		return
	}

	var input TokenRoleInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	if err := h.service.SetTokenRole(r.Context(), managerID, id, r.PathValue("tokenId"), input.Role); err != nil {
		h.writeError(w, r, "set token role", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Token role updated successfully")
}

func (h *Handler) createRole(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "create role", err)
		return
	}

	var input RoleInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	role, err := h.service.CreateRole(r.Context(), managerID, id, input)
	if err != nil {
		h.writeError(w, r, "create role", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, role)
}

func (h *Handler) updateRole(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "update role", err)
		return
	}

	var input RoleUpdateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	role, err := h.service.UpdateRole(r.Context(), managerID, id, r.PathValue("role"), input)
	if err != nil {
		h.writeError(w, r, "update role", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, role)
}

func (h *Handler) deleteRole(w http.ResponseWriter, r *http.Request) {
	managerID, id, err := parseIDs(r)
	if err != nil {
		h.writeError(w, r, "delete role", err)
		return
	}

	if err := h.service.DeleteRole(r.Context(), managerID, id, r.PathValue("role")); err != nil {
		h.writeError(w, r, "delete role", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Role deleted successfully")
}

func (h *Handler) validateAccess(w http.ResponseWriter, r *http.Request) {
	application, ok := FromContext(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, AccessValidation{
		Status:    "valid",
		Message:   "Access token and origin are valid",
		ProjectID: application.ProjectID,
		AppName:   application.Name,
		Role:      RoleFromContext(r.Context()),
	})
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, user.ErrInvalidToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
	case errors.Is(err, ErrInvalidApplicationID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_application_id")
	case errors.Is(err, ErrApplicationNotFound):
		httpx.WriteError(w, http.StatusNotFound, "application_not_found")
	case errors.Is(err, ErrTokenNotFound):
		httpx.WriteError(w, http.StatusNotFound, "token_not_found")
	case errors.Is(err, ErrProjectIDTaken):
		httpx.WriteError(w, http.StatusConflict, "project_id_taken")
	case errors.Is(err, ErrRoleNotFound):
		httpx.WriteError(w, http.StatusNotFound, "role_not_found")
	case errors.Is(err, ErrRoleTaken):
		httpx.WriteError(w, http.StatusConflict, "role_taken")
	case errors.Is(err, ErrRoleReserved):
		httpx.WriteError(w, http.StatusBadRequest, "role_reserved")
	case errors.Is(err, ErrInvalidRoleName):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_role_name")
	case errors.Is(err, ErrInvalidRule):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_rule")
	case errors.Is(err, ErrTooManyRoles):
		httpx.WriteError(w, http.StatusConflict, "too_many_roles")
	case errors.Is(err, ErrOwnedByPage):
		httpx.WriteError(w, http.StatusConflict, "application_owned_by_page")
	case errors.Is(err, ErrRoleInUse):
		httpx.WriteError(w, http.StatusConflict, "role_in_use")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}

func parseIDs(r *http.Request) (bson.ObjectID, bson.ObjectID, error) {
	managerID, err := user.ManagerIDFromContext(r.Context())
	if err != nil {
		return bson.ObjectID{}, bson.ObjectID{}, fmt.Errorf("parse manager id: %w", err)
	}

	id, err := ParseID(r.PathValue("id"))
	if err != nil {
		return bson.ObjectID{}, bson.ObjectID{}, fmt.Errorf("parse application id: %w", err)
	}
	return managerID, id, nil
}

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidApplicationID
	}
	return id, nil
}
