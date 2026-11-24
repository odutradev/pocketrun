package binding

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/kv/handlers/application"
	kvdocument "pocketrun-api/internal/domains/kv/handlers/document"
	"pocketrun-api/internal/domains/kv/utils/kvquery"
	pagerepository "pocketrun-api/internal/repositories/page"
	pagekvrequestrepository "pocketrun-api/internal/repositories/pagekvrequest"
	"pocketrun-api/internal/services/httpx"
)

type PageChecker interface {
	Exists(ctx context.Context, id bson.ObjectID) (bool, error)
	GetByID(ctx context.Context, id bson.ObjectID) (*pagerepository.Page, error)
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
	mux.Handle("GET /pages/{id}/kv/details", authenticate(http.HandlerFunc(h.details)))
	mux.Handle("POST /pages/{id}/kv/enable", authenticate(http.HandlerFunc(h.enable)))
	mux.Handle("PATCH /pages/{id}/kv/set", authenticate(http.HandlerFunc(h.set)))
	mux.Handle("DELETE /pages/{id}/kv/remove", authenticate(http.HandlerFunc(h.remove)))
	mux.Handle("GET /pages/{id}/kv/requests/list", authenticate(http.HandlerFunc(h.requests)))
	mux.Handle("/pages/{id}/kv/preview/{rest...}", authenticate(http.HandlerFunc(h.preview)))
}

func (h *Handler) details(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	details, err := h.service.Details(r.Context(), pageID)
	if err != nil {
		h.writeError(w, r, "get page binding", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, details)
}

func (h *Handler) enable(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	current, err := h.pages.GetByID(r.Context(), pageID)
	if err != nil {
		h.writeError(w, r, "enable page kv", err)
		return
	}

	details, err := h.service.Enable(r.Context(), application.PageInput{PageID: pageID, Title: current.Title, Slug: current.Slug})
	if err != nil {
		h.writeError(w, r, "enable page kv", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, details)
}

func (h *Handler) set(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	var input SetInput
	if err := httpx.Decode(w, r, h.validate, &input); err != nil {
		httpx.WriteDecodeError(w, err)
		return
	}

	details, err := h.service.Set(r.Context(), pageID, input)
	if err != nil {
		h.writeError(w, r, "set page binding", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, details)
}

func (h *Handler) remove(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	if err := h.service.Remove(r.Context(), pageID); err != nil {
		h.writeError(w, r, "remove page binding", err)
		return
	}
	httpx.WriteMessage(w, http.StatusOK, "Page unlinked from kv")
}

func (h *Handler) requests(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	summary, err := h.service.Requests(r.Context(), pageID)
	if err != nil {
		h.writeError(w, r, "list page kv requests", err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, summary)
}

func (h *Handler) preview(w http.ResponseWriter, r *http.Request) {
	pageID, ok := h.pageID(w, r)
	if !ok {
		return
	}

	subject, err := ParseSubject(r.URL.Query().Get("as"))
	if err != nil {
		h.writeError(w, r, "preview page kv", err)
		return
	}
	query := r.URL.Query()
	query.Del("as")
	r.URL.RawQuery = query.Encode()

	request, err := ParseRequest(w, r, h.validate, r.PathValue("rest"))
	if err != nil {
		h.writeError(w, r, "preview page kv", err)
		return
	}

	result, err := h.service.Run(r.Context(), pageID, subject, request)
	if err != nil {
		h.writeError(w, r, "preview page kv", err)
		return
	}
	httpx.WriteJSON(w, result.Status, result.Payload)
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

func (h *Handler) writeError(w http.ResponseWriter, r *http.Request, operation string, err error) {
	var validationError *httpx.ValidationError
	if errors.As(err, &validationError) || errors.Is(err, httpx.ErrInvalidBody) {
		httpx.WriteDecodeError(w, err)
		return
	}
	status, code := ErrorStatus(err)
	if status == http.StatusInternalServerError {
		h.logger.ErrorContext(r.Context(), operation, "error", err)
	}
	httpx.WriteError(w, status, code)
}

func ParseRequest(w http.ResponseWriter, r *http.Request, validate *validator.Validate, rest string) (Request, error) {
	parts := strings.Split(strings.Trim(rest, "/"), "/")
	if len(parts) < 2 || len(parts) > 3 {
		return Request{}, ErrUnknownRoute
	}

	matched, ok := matchRoute(r.Method, pagekvrequestrepository.Action(parts[1]), len(parts) == 3)
	if !ok {
		return Request{}, ErrUnknownRoute
	}

	request := Request{Action: matched.action, Collection: parts[0]}
	if err := kvquery.CheckCollection(request.Collection); err != nil {
		return Request{}, err
	}
	if matched.hasID {
		id, err := bson.ObjectIDFromHex(parts[2])
		if err != nil {
			return Request{}, kvdocument.ErrInvalidDocumentID
		}
		request.DocumentID = id
	}

	if err := decodeAction(w, r, validate, &request); err != nil {
		return Request{}, err
	}
	return request, nil
}

func matchRoute(method string, action pagekvrequestrepository.Action, hasID bool) (route, bool) {
	for _, candidate := range routes {
		if candidate.method == method && candidate.action == action && candidate.hasID == hasID {
			return candidate, true
		}
	}
	return route{}, false
}

func decodeAction(w http.ResponseWriter, r *http.Request, validate *validator.Validate, request *Request) error {
	switch request.Action {
	case pagekvrequestrepository.ActionList:
		query, err := kvquery.ParseListQuery(r.URL.Query())
		if err != nil {
			return err
		}
		request.List = query
	case pagekvrequestrepository.ActionCount:
		filter, err := kvquery.ParseQueryFilter(r.URL.Query())
		if err != nil {
			return err
		}
		request.Filter = filter
	case pagekvrequestrepository.ActionEval:
		filter, err := kvquery.ParseQueryFilter(r.URL.Query())
		if err != nil {
			return err
		}
		request.Filter = filter
		return httpx.DecodeLimited(w, r, validate, &request.Eval, MaxBodyBytes)
	case pagekvrequestrepository.ActionCreate:
		return httpx.DecodeLimited(w, r, validate, &request.Create, MaxBodyBytes)
	case pagekvrequestrepository.ActionUpdate, pagekvrequestrepository.ActionReplace:
		return httpx.DecodeLimited(w, r, validate, &request.Update, MaxBodyBytes)
	}
	return nil
}
