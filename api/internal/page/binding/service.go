package binding

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/application"
	"pocketrun-api/internal/kv"
	"pocketrun-api/internal/page/access"
	"pocketrun-api/internal/page/history"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/user"
)

const (
	logTimeout        = 5 * time.Second
	applicationField  = "kvApplication"
	publicRoleField   = "kvPublicRole"
	roleMappingsField = "kvRoles"
)

type Repository interface {
	Find(ctx context.Context, pageID bson.ObjectID) (*Binding, error)
	Save(ctx context.Context, binding *Binding) error
	Delete(ctx context.Context, pageID bson.ObjectID) error
}

type RequestRepository interface {
	Insert(ctx context.Context, request *LoggedRequest) error
	Recent(ctx context.Context, pageID bson.ObjectID, limit int) ([]LoggedRequest, error)
	Count(ctx context.Context, pageID bson.ObjectID, since time.Time, isDenied bool) (int64, error)
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
	Moments(ctx context.Context, from, to time.Time) ([]time.Time, error)
}

type ApplicationFinder interface {
	Find(ctx context.Context, id bson.ObjectID) (*application.Application, error)
	EnsureForPage(ctx context.Context, managerID bson.ObjectID, input application.PageInput) (*application.Application, bool, error)
	DeleteForPage(ctx context.Context, pageID bson.ObjectID) error
}

type AccessReader interface {
	Get(ctx context.Context, pageID bson.ObjectID) (*access.Access, error)
}

type DocumentStore interface {
	Create(ctx context.Context, scope kv.Scope, collectionName string, input kv.CreateInput) (*kv.Document, error)
	List(ctx context.Context, scope kv.Scope, collectionName string, query kv.ListQuery) ([]kv.Document, int64, error)
	Count(ctx context.Context, scope kv.Scope, collectionName string, filter bson.M) (int64, error)
	Eval(ctx context.Context, scope kv.Scope, collectionName string, queryFilter bson.M, input kv.EvalInput) (kv.EvalResult, error)
	Get(ctx context.Context, scope kv.Scope, collectionName string, id bson.ObjectID) (*kv.Document, error)
	Update(ctx context.Context, scope kv.Scope, collectionName string, id bson.ObjectID, input kv.UpdateInput) (*kv.Document, error)
	Replace(ctx context.Context, scope kv.Scope, collectionName string, id bson.ObjectID, input kv.UpdateInput) (*kv.Document, error)
	Delete(ctx context.Context, scope kv.Scope, collectionName string, id bson.ObjectID) error
}

type EventRecorder interface {
	Record(ctx context.Context, event *history.Event)
}

type ActorResolver interface {
	Actor(ctx context.Context) (user.Actor, error)
}

type Dependencies struct {
	Repository   Repository
	Requests     RequestRepository
	Applications ApplicationFinder
	Access       AccessReader
	Documents    DocumentStore
	History      EventRecorder
	Actors       ActorResolver
	Logger       *slog.Logger
}

type Service struct {
	repository   Repository
	requests     RequestRepository
	applications ApplicationFinder
	access       AccessReader
	documents    DocumentStore
	history      EventRecorder
	actors       ActorResolver
	logger       *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository:   dependencies.Repository,
		requests:     dependencies.Requests,
		applications: dependencies.Applications,
		access:       dependencies.Access,
		documents:    dependencies.Documents,
		history:      dependencies.History,
		actors:       dependencies.Actors,
		logger:       dependencies.Logger,
	}
}

func (s *Service) Details(ctx context.Context, pageID bson.ObjectID) (Details, error) {
	current, err := s.repository.Find(ctx, pageID)
	if errors.Is(err, ErrNotLinked) {
		return Details{}, nil
	}
	if err != nil {
		return Details{}, fmt.Errorf("get page binding %s: %w", pageID.Hex(), err)
	}

	app, err := s.applications.Find(ctx, current.ApplicationID)
	if errors.Is(err, application.ErrApplicationNotFound) {
		return Details{Binding: current}, nil
	}
	if err != nil {
		return Details{}, fmt.Errorf("find linked application %s: %w", current.ApplicationID.Hex(), err)
	}
	return Details{Binding: current, Application: summarize(app)}, nil
}

func (s *Service) Enable(ctx context.Context, input application.PageInput) (Details, error) {
	_, err := s.repository.Find(ctx, input.PageID)
	if err == nil {
		return s.Details(ctx, input.PageID)
	}
	if !errors.Is(err, ErrNotLinked) {
		return Details{}, fmt.Errorf("enable page kv %s: %w", input.PageID.Hex(), err)
	}

	managerID, err := user.ManagerIDFromContext(ctx)
	if err != nil {
		return Details{}, fmt.Errorf("enable page kv %s: %w", input.PageID.Hex(), err)
	}
	app, _, err := s.applications.EnsureForPage(ctx, managerID, input)
	if err != nil {
		return Details{}, fmt.Errorf("enable page kv %s: %w", input.PageID.Hex(), err)
	}
	pageAccess, err := s.access.Get(ctx, input.PageID)
	if err != nil {
		return Details{}, fmt.Errorf("enable page kv %s: %w", input.PageID.Hex(), err)
	}

	next := &Binding{
		PageID:        input.PageID,
		ApplicationID: app.ID,
		PublicRole:    availableRole(app, application.PageReadRole),
		Roles:         defaultMappings(app, pageAccess),
		UpdatedAt:     time.Now(),
	}
	if err := s.repository.Save(ctx, next); err != nil {
		return Details{}, fmt.Errorf("enable page kv %s: %w", input.PageID.Hex(), err)
	}
	s.record(ctx, input.PageID, history.EventKVLinked, bindingChanges(nil, next, "", app.Name))
	return Details{Binding: next, Application: summarize(app)}, nil
}

func (s *Service) Set(ctx context.Context, pageID bson.ObjectID, input SetInput) (Details, error) {
	previous, err := s.repository.Find(ctx, pageID)
	if err != nil {
		return Details{}, fmt.Errorf("set page kv roles %s: %w", pageID.Hex(), err)
	}
	app, err := s.applications.Find(ctx, previous.ApplicationID)
	if errors.Is(err, application.ErrApplicationNotFound) {
		return Details{}, ErrApplicationGone
	}
	if err != nil {
		return Details{}, fmt.Errorf("set page kv roles %s: %w", pageID.Hex(), err)
	}
	if err := checkMappings(app, input); err != nil {
		return Details{}, err
	}

	next := &Binding{PageID: pageID, ApplicationID: app.ID, PublicRole: input.PublicRole, Roles: input.Roles, Revision: previous.Revision + 1, UpdatedAt: time.Now()}
	if err := s.repository.Save(ctx, next); err != nil {
		return Details{}, fmt.Errorf("set page kv roles %s: %w", pageID.Hex(), err)
	}
	if changes := bindingChanges(previous, next, app.Name, app.Name); len(changes) > 0 {
		s.record(ctx, pageID, history.EventKVChanged, changes)
	}
	return Details{Binding: next, Application: summarize(app)}, nil
}

func (s *Service) Remove(ctx context.Context, pageID bson.ObjectID) error {
	previous, err := s.repository.Find(ctx, pageID)
	if err != nil {
		return fmt.Errorf("unlink page %s: %w", pageID.Hex(), err)
	}
	if err := s.repository.Delete(ctx, pageID); err != nil {
		return fmt.Errorf("unlink page %s: %w", pageID.Hex(), err)
	}
	s.record(ctx, pageID, history.EventKVUnlinked, []history.Change{{Field: applicationField, From: s.applicationName(ctx, previous.ApplicationID), To: nil}})
	return nil
}

func (s *Service) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if err := s.repository.Delete(ctx, pageID); err != nil && !errors.Is(err, ErrNotLinked) {
		return fmt.Errorf("delete page binding %s: %w", pageID.Hex(), err)
	}
	if err := s.requests.DeleteAll(ctx, pageID); err != nil {
		return fmt.Errorf("delete page kv requests %s: %w", pageID.Hex(), err)
	}
	if err := s.applications.DeleteForPage(ctx, pageID); err != nil {
		return fmt.Errorf("delete page kv application %s: %w", pageID.Hex(), err)
	}
	return nil
}

func (s *Service) Requests(ctx context.Context, pageID bson.ObjectID) (RequestSummary, error) {
	since := time.Now().Add(-24 * time.Hour)
	recent, err := s.requests.Recent(ctx, pageID, RequestPageSize)
	if err != nil {
		return RequestSummary{}, fmt.Errorf("list page kv requests %s: %w", pageID.Hex(), err)
	}
	total, err := s.requests.Count(ctx, pageID, since, false)
	if err != nil {
		return RequestSummary{}, fmt.Errorf("count page kv requests %s: %w", pageID.Hex(), err)
	}
	denied, err := s.requests.Count(ctx, pageID, since, true)
	if err != nil {
		return RequestSummary{}, fmt.Errorf("count denied page kv requests %s: %w", pageID.Hex(), err)
	}
	return RequestSummary{Requests: recent, Total: total, Denied: denied}, nil
}

func (s *Service) Moments(ctx context.Context, from, to time.Time) ([]time.Time, error) {
	moments, err := s.requests.Moments(ctx, from, to)
	if err != nil {
		return nil, fmt.Errorf("list page kv request moments: %w", err)
	}
	return moments, nil
}

func (s *Service) Describe(ctx context.Context, pageID bson.ObjectID, subject Subject) (*Runtime, error) {
	current, err := s.repository.Find(ctx, pageID)
	if errors.Is(err, ErrNotLinked) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("describe page binding %s: %w", pageID.Hex(), err)
	}

	runtime := &Runtime{Rules: []RuntimeRule{}}
	roleName := current.role(subject)
	if roleName == "" {
		return runtime, nil
	}

	app, err := s.applications.Find(ctx, current.ApplicationID)
	if errors.Is(err, application.ErrApplicationNotFound) {
		return runtime, nil
	}
	if err != nil {
		return nil, fmt.Errorf("describe page binding %s: %w", pageID.Hex(), err)
	}
	return describeRole(app, roleName), nil
}

func (s *Service) Run(ctx context.Context, pageID bson.ObjectID, subject Subject, request Request) (Result, error) {
	result, kvRole, err := s.run(ctx, pageID, subject, request)
	s.log(ctx, pageID, subject, request, kvRole, result, err)
	return result, err
}

func (s *Service) run(ctx context.Context, pageID bson.ObjectID, subject Subject, request Request) (Result, string, error) {
	current, err := s.repository.Find(ctx, pageID)
	if err != nil {
		return Result{}, "", err
	}

	roleName := current.role(subject)
	if roleName == "" {
		return Result{}, "", ErrNoAccess
	}

	app, err := s.applications.Find(ctx, current.ApplicationID)
	if errors.Is(err, application.ErrApplicationNotFound) {
		return Result{}, roleName, ErrApplicationGone
	}
	if err != nil {
		return Result{}, roleName, err
	}

	permission, err := app.Authorize(roleName, request.Collection, request.Action.operation())
	if err != nil {
		return Result{}, roleName, err
	}
	scope := kv.NewScope(app, permission)
	scope.Role = roleName

	result, err := s.execute(ctx, scope, request)
	return result, roleName, err
}

func (s *Service) execute(ctx context.Context, scope kv.Scope, request Request) (Result, error) {
	switch request.Action {
	case ActionList:
		documents, total, err := s.documents.List(ctx, scope, request.Collection, request.List)
		if err != nil {
			return Result{}, err
		}
		if !request.List.Paginate {
			return Result{Status: http.StatusOK, Payload: documents}, nil
		}
		return Result{Status: http.StatusOK, Payload: kv.NewPage(documents, total, request.List.Page, request.List.Limit)}, nil
	case ActionCount:
		count, err := s.documents.Count(ctx, scope, request.Collection, request.Filter)
		return Result{Status: http.StatusOK, Payload: kv.CountResult{Count: count}}, err
	case ActionEval:
		evaluated, err := s.documents.Eval(ctx, scope, request.Collection, request.Filter, request.Eval)
		return Result{Status: http.StatusOK, Payload: evaluated}, err
	case ActionGet:
		document, err := s.documents.Get(ctx, scope, request.Collection, request.DocumentID)
		return Result{Status: http.StatusOK, Payload: document}, err
	case ActionCreate:
		document, err := s.documents.Create(ctx, scope, request.Collection, request.Create)
		return Result{Status: http.StatusCreated, Payload: document}, err
	case ActionUpdate:
		document, err := s.documents.Update(ctx, scope, request.Collection, request.DocumentID, request.Update)
		return Result{Status: http.StatusOK, Payload: document}, err
	case ActionReplace:
		document, err := s.documents.Replace(ctx, scope, request.Collection, request.DocumentID, request.Update)
		return Result{Status: http.StatusOK, Payload: document}, err
	case ActionDelete:
		err := s.documents.Delete(ctx, scope, request.Collection, request.DocumentID)
		return Result{Status: http.StatusOK, Payload: httpx.MessageResponse{Message: "Document deleted successfully"}}, err
	}
	return Result{}, ErrUnknownRoute
}

func (s *Service) log(ctx context.Context, pageID bson.ObjectID, subject Subject, request Request, kvRole string, result Result, err error) {
	status, code := result.Status, ""
	if err != nil {
		status, code = ErrorStatus(err)
	}
	entry := &LoggedRequest{
		ID:         bson.NewObjectID(),
		PageID:     pageID,
		Action:     request.Action,
		Collection: request.Collection,
		KVRole:     kvRole,
		PageRole:   subject.PageRole,
		IsPreview:  subject.IsPreview,
		Status:     status,
		Code:       code,
		At:         time.Now(),
	}

	logContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), logTimeout)
	defer cancel()
	if insertErr := s.requests.Insert(logContext, entry); insertErr != nil {
		s.logger.WarnContext(ctx, "log page kv request", "pageId", pageID.Hex(), "error", insertErr)
	}
}

func (s *Service) record(ctx context.Context, pageID bson.ObjectID, eventType history.EventType, changes []history.Change) {
	actor, err := s.actors.Actor(ctx)
	if err != nil {
		s.logger.WarnContext(ctx, "resolve page binding actor", "error", err)
	}
	s.history.Record(ctx, history.NewEvent(pageID, eventType, actor, changes, time.Now()))
}

func (s *Service) applicationName(ctx context.Context, id bson.ObjectID) string {
	app, err := s.applications.Find(ctx, id)
	if err != nil {
		return id.Hex()
	}
	return app.Name
}

func checkMappings(app *application.Application, input SetInput) error {
	if input.PublicRole != "" && !app.HasRole(input.PublicRole) {
		return application.ErrRoleNotFound
	}
	seen := map[string]bool{}
	for _, mapping := range input.Roles {
		if seen[mapping.PageRole] {
			return ErrInvalidMapping
		}
		seen[mapping.PageRole] = true
		if mapping.KVRole != "" && !app.HasRole(mapping.KVRole) {
			return application.ErrRoleNotFound
		}
	}
	return nil
}

func availableRole(app *application.Application, name string) string {
	if !app.HasRole(name) {
		return ""
	}
	return name
}

func defaultMappings(app *application.Application, pageAccess *access.Access) []RoleMapping {
	role := availableRole(app, application.PageWriteRole)
	mappings := []RoleMapping{{PageRole: "", KVRole: role}}
	for _, key := range pageAccess.Keys {
		if key.Role != "" {
			mappings = append(mappings, RoleMapping{PageRole: key.Role, KVRole: role})
		}
	}
	return mappings
}

func bindingChanges(previous, next *Binding, previousName, applicationName string) []history.Change {
	if previous == nil {
		return []history.Change{
			{Field: applicationField, From: nil, To: applicationName},
			{Field: publicRoleField, From: nil, To: next.PublicRole},
			{Field: roleMappingsField, From: nil, To: describeMappings(next.Roles)},
		}
	}

	changes := []history.Change{}
	if previous.ApplicationID != next.ApplicationID {
		changes = append(changes, history.Change{Field: applicationField, From: previousName, To: applicationName})
	}
	if previous.PublicRole != next.PublicRole {
		changes = append(changes, history.Change{Field: publicRoleField, From: previous.PublicRole, To: next.PublicRole})
	}
	if before, after := describeMappings(previous.Roles), describeMappings(next.Roles); before != after {
		changes = append(changes, history.Change{Field: roleMappingsField, From: before, To: after})
	}
	return changes
}

func describeMappings(mappings []RoleMapping) string {
	described := []string{}
	for _, mapping := range mappings {
		if mapping.KVRole == "" {
			continue
		}
		pageRole := mapping.PageRole
		if pageRole == "" {
			pageRole = "geral"
		}
		described = append(described, pageRole+" → "+mapping.KVRole)
	}
	slices.Sort(described)
	return strings.Join(described, ", ")
}

func describeRole(app *application.Application, roleName string) *Runtime {
	runtime := &Runtime{Role: roleName, Rules: []RuntimeRule{}}
	if roleName == application.AdminRole {
		runtime.Rules = append(runtime.Rules, RuntimeRule{Collection: application.AnyCollection, Operations: []application.Operation{application.OperationRead, application.OperationCreate, application.OperationUpdate, application.OperationDelete}})
		return runtime
	}

	role, found := app.Role(roleName)
	if !found {
		return &Runtime{Rules: []RuntimeRule{}}
	}
	runtime.IsOwnDocumentsOnly = role.IsOwnDocumentsOnly
	for _, rule := range role.Rules {
		runtime.Rules = append(runtime.Rules, RuntimeRule{Collection: rule.Collection, Operations: rule.Operations})
	}
	return runtime
}

func summarize(app *application.Application) *ApplicationSummary {
	return &ApplicationSummary{ID: app.ID, PageID: app.PageID, Name: app.Name, ProjectID: app.ProjectID, Roles: app.Roles}
}

func ErrorStatus(err error) (int, string) {
	if status, code, ok := kv.ErrorStatus(err); ok {
		return status, code
	}
	var validationError *httpx.ValidationError
	switch {
	case errors.As(err, &validationError):
		return http.StatusBadRequest, "validation_failed"
	case errors.Is(err, httpx.ErrInvalidBody):
		return http.StatusBadRequest, "invalid_body"
	case errors.Is(err, ErrNotLinked):
		return http.StatusNotFound, "kv_not_linked"
	case errors.Is(err, ErrApplicationGone):
		return http.StatusNotFound, "kv_application_missing"
	case errors.Is(err, ErrNoAccess):
		return http.StatusForbidden, "kv_access_denied"
	case errors.Is(err, application.ErrOperationForbidden):
		return http.StatusForbidden, "forbidden_operation"
	case errors.Is(err, ErrUnknownRoute):
		return http.StatusNotFound, "route_not_found"
	case errors.Is(err, ErrInvalidSubject):
		return http.StatusBadRequest, "invalid_preview_role"
	case errors.Is(err, ErrInvalidMapping):
		return http.StatusBadRequest, "invalid_role_mapping"
	case errors.Is(err, application.ErrRoleNotFound):
		return http.StatusBadRequest, "role_not_found"
	case errors.Is(err, application.ErrInvalidApplicationID):
		return http.StatusBadRequest, "invalid_application_id"
	case errors.Is(err, application.ErrApplicationNotFound):
		return http.StatusNotFound, "application_not_found"
	}
	return http.StatusInternalServerError, "internal_error"
}
