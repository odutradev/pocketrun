package kv

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/application"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/user"
)

type ApplicationFinder interface {
	GetByID(ctx context.Context, managerID, id bson.ObjectID) (*application.Application, error)
}

type Handler struct {
	service      *Service
	applications ApplicationFinder
	validate     *validator.Validate
	logger       *slog.Logger
}

func NewHandler(service *Service, applications ApplicationFinder, validate *validator.Validate, logger *slog.Logger) *Handler {
	return &Handler{service: service, applications: applications, validate: validate, logger: logger}
}

func (h *Handler) RegisterPublic(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("POST /kv/{collection}/create", authenticate(http.HandlerFunc(h.create)))
	mux.Handle("GET /kv/{collection}/get-all", authenticate(http.HandlerFunc(h.list)))
	mux.Handle("GET /kv/{collection}/get/{id}", authenticate(http.HandlerFunc(h.get)))
	mux.Handle("PATCH /kv/{collection}/update/{id}", authenticate(http.HandlerFunc(h.update)))
	mux.Handle("DELETE /kv/{collection}/delete/{id}", authenticate(http.HandlerFunc(h.delete)))
	mux.Handle("DELETE /kv/{collection}/delete-all", authenticate(http.HandlerFunc(h.deleteCollection)))
	mux.Handle("DELETE /kv/project/delete-all", authenticate(http.HandlerFunc(h.deleteProject)))
}

func (h *Handler) RegisterAdmin(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /apps/{id}/explorer/collections", authenticate(http.HandlerFunc(h.listCollections)))
	mux.Handle("GET /apps/{id}/explorer/collections/{collection}/documents", authenticate(http.HandlerFunc(h.exploreCollection)))
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, ok := application.FromContext(ctx)
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
		return
	}

	var input CreateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	document, err := h.service.Create(ctx, app, r.PathValue("collection"), input)
	if err != nil {
		h.writeError(w, r, "create document", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, document)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, ok := application.FromContext(ctx)
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
		return
	}

	query := parseListQuery(r.URL.Query())
	documents, total, err := h.service.List(ctx, app, r.PathValue("collection"), query)
	if err != nil {
		h.writeError(w, r, "list documents", err)
		return
	}

	if !query.Paginate {
		httpx.WriteJSON(w, http.StatusOK, documents)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, NewPage(documents, total, query.Page, query.Limit))
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, id, err := documentTarget(r)
	if err != nil {
		h.writeError(w, r, "get document", err)
		return
	}

	document, err := h.service.Get(ctx, app, r.PathValue("collection"), id)
	if err != nil {
		h.writeError(w, r, "get document", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, document)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, id, err := documentTarget(r)
	if err != nil {
		h.writeError(w, r, "update document", err)
		return
	}

	var input UpdateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	if err := h.service.Update(ctx, app, r.PathValue("collection"), id, input); err != nil {
		h.writeError(w, r, "update document", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Document updated successfully")
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, id, err := documentTarget(r)
	if err != nil {
		h.writeError(w, r, "delete document", err)
		return
	}

	if err := h.service.Delete(ctx, app, r.PathValue("collection"), id); err != nil {
		h.writeError(w, r, "delete document", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Document deleted successfully")
}

func (h *Handler) deleteCollection(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, ok := application.FromContext(ctx)
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
		return
	}

	deletedCount, err := h.service.DeleteCollection(ctx, app, r.PathValue("collection"))
	if err != nil {
		h.writeError(w, r, "delete collection", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, DeleteResult{Message: "Collection cleared successfully", DeletedCount: deletedCount})
}

func (h *Handler) deleteProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, ok := application.FromContext(ctx)
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
		return
	}

	deletedCount, err := h.service.DeleteByApplicationID(ctx, app.ID)
	if err != nil {
		h.writeError(w, r, "delete project documents", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, DeleteResult{Message: "All project data cleared successfully", DeletedCount: deletedCount})
}

func (h *Handler) listCollections(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, err := h.ownedApplication(r)
	if err != nil {
		h.writeError(w, r, "list collections", err)
		return
	}

	collectionNames, err := h.service.ListCollections(ctx, app.ID)
	if err != nil {
		h.writeError(w, r, "list collections", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, collectionNames)
}

func (h *Handler) exploreCollection(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	app, err := h.ownedApplication(r)
	if err != nil {
		h.writeError(w, r, "explore collection", err)
		return
	}

	query := r.URL.Query()
	page := parsePositive(query.Get("page"), 1, 0)
	limit := parsePositive(query.Get("limit"), DefaultExplorerLimit, MaxExplorerLimit)

	documentsPage, err := h.service.ExploreCollection(ctx, app.ID, r.PathValue("collection"), page, limit)
	if err != nil {
		h.writeError(w, r, "explore collection", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, documentsPage)
}

func (h *Handler) ownedApplication(r *http.Request) (*application.Application, error) {
	ctx := r.Context()
	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	id, err := application.ParseID(r.PathValue("id"))
	if err != nil {
		return nil, err
	}
	return h.applications.GetByID(ctx, managerID, id)
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	switch {
	case errors.Is(err, application.ErrInvalidAccessToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
	case errors.Is(err, user.ErrInvalidToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
	case errors.Is(err, application.ErrInvalidApplicationID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_application_id")
	case errors.Is(err, application.ErrApplicationNotFound):
		httpx.WriteError(w, http.StatusNotFound, "application_not_found")
	case errors.Is(err, ErrInvalidDocumentID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_document_id")
	case errors.Is(err, ErrDocumentNotFound):
		httpx.WriteError(w, http.StatusNotFound, "document_not_found")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}

func documentTarget(r *http.Request) (*application.Application, bson.ObjectID, error) {
	app, ok := application.FromContext(r.Context())
	if !ok {
		return nil, bson.ObjectID{}, application.ErrInvalidAccessToken
	}

	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		return nil, bson.ObjectID{}, ErrInvalidDocumentID
	}
	return app, id, nil
}

func parseListQuery(values url.Values) ListQuery {
	filters := map[string]any{}
	for key, keyValues := range values {
		if key == "page" || key == "limit" || key == "pagination" || len(keyValues) == 0 {
			continue
		}
		filters[key] = parseFilterValue(keyValues[0])
	}

	return ListQuery{
		Filters:  filters,
		Page:     parsePositive(values.Get("page"), 1, 0),
		Limit:    parsePositive(values.Get("limit"), DefaultListLimit, MaxListLimit),
		Paginate: values.Get("pagination") == "true" || values.Has("page") || values.Has("limit"),
	}
}

func parseFilterValue(raw string) any {
	if boolean, err := strconv.ParseBool(raw); err == nil {
		return boolean
	}
	if number, err := strconv.ParseFloat(raw, 64); err == nil {
		return number
	}
	return raw
}

func parsePositive(raw string, fallback, maximum int) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 || (maximum > 0 && value > maximum) {
		return fallback
	}
	return value
}
