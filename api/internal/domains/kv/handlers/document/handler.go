package document

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/kv/handlers/application"
	"pocketrun-api/internal/domains/kv/middlewares/appauth"
	"pocketrun-api/internal/domains/kv/utils/csvexport"
	"pocketrun-api/internal/domains/kv/utils/kvquery"
	"pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/domains/user/middlewares/managerauth"
	applicationrepository "pocketrun-api/internal/repositories/application"
	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
	"pocketrun-api/internal/services/httpx"
)

type ApplicationFinder interface {
	GetByID(ctx context.Context, managerID, id bson.ObjectID) (*applicationrepository.Application, error)
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
	route := func(pattern string, handle http.HandlerFunc) {
		mux.Handle(pattern, authenticate(h.counted(handle)))
	}
	route("GET /kv/project/export", h.exportProject)
	route("POST /kv/project/import", h.importProject)
	route("DELETE /kv/project/delete-all", h.deleteProject)
	route("POST /kv/{collection}/create", h.create)
	route("GET /kv/{collection}/get-all", h.list)
	route("GET /kv/{collection}/count", h.count)
	route("POST /kv/{collection}/eval", h.eval)
	route("GET /kv/{collection}/get/{id}", h.get)
	route("PATCH /kv/{collection}/update/{id}", h.update)
	route("PUT /kv/{collection}/replace/{id}", h.replace)
	route("DELETE /kv/{collection}/delete/{id}", h.delete)
	route("DELETE /kv/{collection}/delete-all", h.deleteCollection)
	route("GET /kv/{collection}/export", h.export)
	route("POST /kv/{collection}/import", h.importCollection)
}

func (h *Handler) counted(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if app, ok := appauth.FromContext(r.Context()); ok {
			h.service.RecordUsage(r.Context(), app.ID, app.ManagerID)
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) RegisterAdmin(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /apps/{id}/explorer/collections/list", authenticate(http.HandlerFunc(h.listCollections)))
	mux.Handle("GET /apps/{id}/explorer/collections/{collection}/documents/list", authenticate(http.HandlerFunc(h.exploreCollection)))
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationCreate)
	if !ok {
		return
	}

	var input CreateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	document, err := h.service.Create(r.Context(), scope, r.PathValue("collection"), input)
	if err != nil {
		h.writeError(w, r, "create document", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, document)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationRead)
	if !ok {
		return
	}

	query, err := kvquery.ParseListQuery(r.URL.Query())
	if err != nil {
		h.writeError(w, r, "list documents", err)
		return
	}

	documents, total, err := h.service.List(r.Context(), scope, r.PathValue("collection"), query)
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

func (h *Handler) count(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationRead)
	if !ok {
		return
	}

	filter, err := kvquery.ParseQueryFilter(r.URL.Query())
	if err != nil {
		h.writeError(w, r, "count documents", err)
		return
	}

	count, err := h.service.Count(r.Context(), scope, r.PathValue("collection"), filter)
	if err != nil {
		h.writeError(w, r, "count documents", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, CountResult{Count: count})
}

func (h *Handler) eval(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationRead)
	if !ok {
		return
	}

	filter, err := kvquery.ParseQueryFilter(r.URL.Query())
	if err != nil {
		h.writeError(w, r, "eval documents", err)
		return
	}

	var input EvalInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	result, err := h.service.Eval(r.Context(), scope, r.PathValue("collection"), filter, input)
	if err != nil {
		h.writeError(w, r, "eval documents", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, result)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	scope, id, ok := h.documentTarget(w, r, applicationrepository.OperationRead)
	if !ok {
		return
	}

	document, err := h.service.Get(r.Context(), scope, r.PathValue("collection"), id)
	if err != nil {
		h.writeError(w, r, "get document", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, document)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	h.change(w, r, "update document", h.service.Update)
}

func (h *Handler) replace(w http.ResponseWriter, r *http.Request) {
	h.change(w, r, "replace document", h.service.Replace)
}

func (h *Handler) change(w http.ResponseWriter, r *http.Request, operation string, apply func(context.Context, kvdocumentrepository.Scope, string, bson.ObjectID, UpdateInput) (*kvdocumentrepository.Document, error)) {
	scope, id, ok := h.documentTarget(w, r, applicationrepository.OperationUpdate)
	if !ok {
		return
	}

	var input UpdateInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	document, err := apply(r.Context(), scope, r.PathValue("collection"), id, input)
	if err != nil {
		h.writeError(w, r, operation, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, document)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	scope, id, ok := h.documentTarget(w, r, applicationrepository.OperationDelete)
	if !ok {
		return
	}

	if err := h.service.Delete(r.Context(), scope, r.PathValue("collection"), id); err != nil {
		h.writeError(w, r, "delete document", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Document deleted successfully")
}

func (h *Handler) deleteCollection(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationManage)
	if !ok {
		return
	}

	deletedCount, err := h.service.DeleteCollection(r.Context(), scope, r.PathValue("collection"))
	if err != nil {
		h.writeError(w, r, "delete collection", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, DeleteResult{Message: "Collection cleared successfully", DeletedCount: deletedCount})
}

func (h *Handler) export(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationRead)
	if !ok {
		return
	}

	format, err := ParseExportFormat(r.URL.Query().Get("format"))
	if err != nil {
		h.writeError(w, r, "export collection", err)
		return
	}

	collectionName := r.PathValue("collection")
	documents, err := h.service.Export(r.Context(), scope, collectionName)
	if err != nil {
		h.writeError(w, r, "export collection", err)
		return
	}

	filename := scope.ProjectID + "-" + collectionName
	if format == ExportCSV {
		body, err := csvexport.Documents(documents)
		if err != nil {
			h.writeError(w, r, "export collection", err)
			return
		}
		writeDownload(w, r, h.logger, filename+".csv", "text/csv; charset=utf-8", body)
		return
	}
	h.writeJSONDownload(w, r, filename+".json", documents)
}

func (h *Handler) exportProject(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationManage)
	if !ok {
		return
	}

	format, err := ParseExportFormat(r.URL.Query().Get("format"))
	if err != nil {
		h.writeError(w, r, "export project", err)
		return
	}

	collections, err := h.service.ExportProject(r.Context(), scope)
	if err != nil {
		h.writeError(w, r, "export project", err)
		return
	}

	filename := "project-" + scope.ProjectID
	if format == ExportCSV {
		body, err := csvexport.Project(collections)
		if err != nil {
			h.writeError(w, r, "export project", err)
			return
		}
		writeDownload(w, r, h.logger, filename+".csv", "text/csv; charset=utf-8", body)
		return
	}
	h.writeJSONDownload(w, r, filename+".json", collections)
}

func (h *Handler) importCollection(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationCreate)
	if !ok {
		return
	}

	var input ImportInput
	if err := httpx.DecodeLimited(w, r, h.validate, &input, MaxImportBytes); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	result, err := h.service.Import(r.Context(), scope, r.PathValue("collection"), input.Data)
	if err != nil {
		h.writeError(w, r, "import collection", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, result)
}

func (h *Handler) importProject(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationManage)
	if !ok {
		return
	}

	var input ProjectImportInput
	if err := httpx.DecodeLimited(w, r, h.validate, &input, MaxImportBytes); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	result, err := h.service.ImportProject(r.Context(), scope, input.Data)
	if err != nil {
		h.writeError(w, r, "import project", err)
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, result)
}

func (h *Handler) deleteProject(w http.ResponseWriter, r *http.Request) {
	scope, ok := h.scope(w, r, applicationrepository.OperationManage)
	if !ok {
		return
	}

	deletedCount, err := h.service.DeleteByApplicationID(r.Context(), scope.ApplicationID)
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

	var params ExplorerParams
	if err := httpx.DecodeQuery(r, h.validate, &params); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	documentsPage, err := h.service.ExploreCollection(ctx, app.ID, r.PathValue("collection"), params.PageOrDefault(), params.LimitOrDefault())
	if err != nil {
		h.writeError(w, r, "explore collection", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, documentsPage)
}

func (h *Handler) scope(w http.ResponseWriter, r *http.Request, operation applicationrepository.Operation) (kvdocumentrepository.Scope, bool) {
	ctx := r.Context()
	app, ok := appauth.FromContext(ctx)
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_access_token")
		return kvdocumentrepository.Scope{}, false
	}

	permission, err := app.Authorize(appauth.RoleFromContext(ctx), r.PathValue("collection"), operation)
	if err != nil {
		h.writeError(w, r, "authorize kv operation", err)
		return kvdocumentrepository.Scope{}, false
	}
	return NewScope(app, permission), true
}

func (h *Handler) documentTarget(w http.ResponseWriter, r *http.Request, operation applicationrepository.Operation) (kvdocumentrepository.Scope, bson.ObjectID, bool) {
	scope, ok := h.scope(w, r, operation)
	if !ok {
		return kvdocumentrepository.Scope{}, bson.ObjectID{}, false
	}

	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		h.writeError(w, r, "parse document id", ErrInvalidDocumentID)
		return kvdocumentrepository.Scope{}, bson.ObjectID{}, false
	}
	return scope, id, true
}

func (h *Handler) ownedApplication(r *http.Request) (*applicationrepository.Application, error) {
	ctx := r.Context()
	managerID, err := managerauth.ManagerIDFromContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("parse manager id: %w", err)
	}

	id, err := application.ParseID(r.PathValue("id"))
	if err != nil {
		return nil, fmt.Errorf("parse application id: %w", err)
	}

	app, err := h.applications.GetByID(ctx, managerID, id)
	if err != nil {
		return nil, fmt.Errorf("find owned application %s: %w", id.Hex(), err)
	}
	return app, nil
}

func (h *Handler) writeJSONDownload(w http.ResponseWriter, r *http.Request, filename string, payload any) {
	body, err := json.Marshal(payload)
	if err != nil {
		h.writeError(w, r, "encode export", err)
		return
	}
	writeDownload(w, r, h.logger, filename, "application/json", body)
}

func writeDownload(w http.ResponseWriter, r *http.Request, logger *slog.Logger, filename, contentType string, body []byte) {
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write(body); err != nil {
		logger.WarnContext(r.Context(), "write export", "error", err)
	}
}

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	if status, code, ok := ErrorStatus(err); ok {
		httpx.WriteError(w, status, code)
		return
	}
	switch {
	case errors.Is(err, user.ErrInvalidToken):
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
	case errors.Is(err, application.ErrInvalidApplicationID):
		httpx.WriteError(w, http.StatusBadRequest, "invalid_application_id")
	case errors.Is(err, application.ErrApplicationNotFound):
		httpx.WriteError(w, http.StatusNotFound, "application_not_found")
	default:
		h.logger.ErrorContext(r.Context(), operation, "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
	}
}

func ErrorStatus(err error) (int, string, bool) {
	switch {
	case errors.Is(err, application.ErrInvalidAccessToken):
		return http.StatusUnauthorized, "invalid_access_token", true
	case errors.Is(err, application.ErrOperationForbidden):
		return http.StatusForbidden, "forbidden_operation", true
	case errors.Is(err, ErrInvalidDocumentID):
		return http.StatusBadRequest, "invalid_document_id", true
	case errors.Is(err, ErrDocumentNotFound):
		return http.StatusNotFound, "document_not_found", true
	case errors.Is(err, ErrInvalidCollection):
		return http.StatusBadRequest, "invalid_collection", true
	case errors.Is(err, ErrReservedCollection):
		return http.StatusBadRequest, "reserved_collection", true
	case errors.Is(err, ErrInvalidFilter):
		return http.StatusBadRequest, "invalid_filter", true
	case errors.Is(err, ErrInvalidSort):
		return http.StatusBadRequest, "invalid_sort", true
	case errors.Is(err, ErrInvalidField):
		return http.StatusBadRequest, "invalid_field", true
	case errors.Is(err, ErrInvalidFormat):
		return http.StatusBadRequest, "invalid_format", true
	case errors.Is(err, ErrInvalidImport):
		return http.StatusBadRequest, "invalid_import", true
	case errors.Is(err, ErrTooManyItems):
		return http.StatusRequestEntityTooLarge, "too_many_items", true
	case errors.Is(err, ErrCollectionFull):
		return http.StatusConflict, "collection_full", true
	}
	return 0, "", false
}
