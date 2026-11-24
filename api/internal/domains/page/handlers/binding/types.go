package binding

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	kvdocument "pocketrun-api/internal/domains/kv/handlers/document"
	"pocketrun-api/internal/domains/kv/utils/kvquery"
	applicationrepository "pocketrun-api/internal/repositories/application"
	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
	pagebindingrepository "pocketrun-api/internal/repositories/pagebinding"
	pagekvrequestrepository "pocketrun-api/internal/repositories/pagekvrequest"
	"pocketrun-api/internal/services/httpx"
)

const (
	MaxBodyBytes      = 256 << 10
	MaxRoleMappings   = 21
	RequestPageSize   = 50
	PreviewPublic     = "public"
	PreviewGeneralPIN = "pin"
	PreviewRolePrefix = "role:"
)

var (
	ErrNotLinked       = pagebindingrepository.ErrNotLinked
	ErrNoAccess        = errors.New("visitor has no kv role on this page")
	ErrUnknownRoute    = errors.New("unknown kv route")
	ErrInvalidSubject  = errors.New("invalid preview subject")
	ErrInvalidMapping  = errors.New("invalid role mapping")
	ErrApplicationGone = errors.New("linked application no longer exists")
)

func operation(a pagekvrequestrepository.Action) applicationrepository.Operation {
	switch a {
	case pagekvrequestrepository.ActionCreate:
		return applicationrepository.OperationCreate
	case pagekvrequestrepository.ActionUpdate, pagekvrequestrepository.ActionReplace:
		return applicationrepository.OperationUpdate
	case pagekvrequestrepository.ActionDelete:
		return applicationrepository.OperationDelete
	}
	return applicationrepository.OperationRead
}

func role(b *pagebindingrepository.Binding, subject Subject) string {
	if !subject.IsProtected {
		return b.PublicRole
	}
	for _, mapping := range b.Roles {
		if mapping.PageRole == subject.PageRole {
			return mapping.KVRole
		}
	}
	return ""
}

type ApplicationSummary struct {
	ID        bson.ObjectID                `json:"id"`
	PageID    *bson.ObjectID               `json:"pageId"`
	Name      string                       `json:"name"`
	ProjectID string                       `json:"projectId"`
	Roles     []applicationrepository.Role `json:"roles"`
}

type Details struct {
	Binding     *pagebindingrepository.Binding `json:"binding"`
	Application *ApplicationSummary            `json:"application"`
}

type SetInput struct {
	PublicRole string                              `json:"publicRole" validate:"max=40"`
	Roles      []pagebindingrepository.RoleMapping `json:"roles" validate:"max=21,dive"`
}

func (i *SetInput) Normalize() {
	i.PublicRole = strings.ToLower(strings.TrimSpace(i.PublicRole))
	roles := make([]pagebindingrepository.RoleMapping, 0, len(i.Roles))
	for _, mapping := range i.Roles {
		roles = append(roles, pagebindingrepository.RoleMapping{PageRole: strings.ToLower(strings.TrimSpace(mapping.PageRole)), KVRole: strings.ToLower(strings.TrimSpace(mapping.KVRole))})
	}
	i.Roles = roles
}

type Subject struct {
	IsProtected bool
	PageRole    string
	IsPreview   bool
}

func ParseSubject(value string) (Subject, error) {
	switch {
	case value == PreviewPublic:
		return Subject{IsPreview: true}, nil
	case value == PreviewGeneralPIN:
		return Subject{IsProtected: true, IsPreview: true}, nil
	case strings.HasPrefix(value, PreviewRolePrefix) && len(value) > len(PreviewRolePrefix):
		return Subject{IsProtected: true, PageRole: strings.TrimPrefix(value, PreviewRolePrefix), IsPreview: true}, nil
	}
	return Subject{}, ErrInvalidSubject
}

type Request struct {
	Action     pagekvrequestrepository.Action
	Collection string
	DocumentID bson.ObjectID
	List       kvdocumentrepository.ListQuery
	Filter     bson.M
	Create     kvdocument.CreateInput
	Update     kvdocument.UpdateInput
	Eval       kvdocument.EvalInput
}

type Result struct {
	Status  int
	Payload any
}

type RuntimeRule struct {
	Collection string                            `json:"collection"`
	Operations []applicationrepository.Operation `json:"operations"`
}

type Runtime struct {
	Role               string        `json:"role"`
	IsOwnDocumentsOnly bool          `json:"isOwnDocumentsOnly"`
	Rules              []RuntimeRule `json:"rules"`
}

type RequestSummary struct {
	Requests []pagekvrequestrepository.Request `json:"requests"`
	Total    int64                             `json:"total"`
	Denied   int64                             `json:"denied"`
}

type route struct {
	method string
	action pagekvrequestrepository.Action
	hasID  bool
}

var routes = []route{
	{method: http.MethodGet, action: pagekvrequestrepository.ActionList},
	{method: http.MethodGet, action: pagekvrequestrepository.ActionCount},
	{method: http.MethodPost, action: pagekvrequestrepository.ActionEval},
	{method: http.MethodGet, action: pagekvrequestrepository.ActionGet, hasID: true},
	{method: http.MethodPost, action: pagekvrequestrepository.ActionCreate},
	{method: http.MethodPatch, action: pagekvrequestrepository.ActionUpdate, hasID: true},
	{method: http.MethodPut, action: pagekvrequestrepository.ActionReplace, hasID: true},
	{method: http.MethodDelete, action: pagekvrequestrepository.ActionDelete, hasID: true},
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

const (
	logTimeout        = 5 * time.Second
	applicationField  = "kvApplication"
	publicRoleField   = "kvPublicRole"
	roleMappingsField = "kvRoles"
)
