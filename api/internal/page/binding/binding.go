package binding

import (
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/application"
	"pocketrun-api/internal/kv"
	pagebindingrepository "pocketrun-api/internal/repositories/pagebinding"
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

func operation(a Action) application.Operation {
	switch a {
	case ActionCreate:
		return application.OperationCreate
	case ActionUpdate, ActionReplace:
		return application.OperationUpdate
	case ActionDelete:
		return application.OperationDelete
	}
	return application.OperationRead
}

func role(b *Binding, subject Subject) string {
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
	ID        bson.ObjectID      `json:"id"`
	PageID    *bson.ObjectID     `json:"pageId"`
	Name      string             `json:"name"`
	ProjectID string             `json:"projectId"`
	Roles     []application.Role `json:"roles"`
}

type Details struct {
	Binding     *Binding            `json:"binding"`
	Application *ApplicationSummary `json:"application"`
}

type SetInput struct {
	PublicRole string        `json:"publicRole" validate:"max=40"`
	Roles      []RoleMapping `json:"roles" validate:"max=21,dive"`
}

func (i *SetInput) Normalize() {
	i.PublicRole = strings.ToLower(strings.TrimSpace(i.PublicRole))
	roles := make([]RoleMapping, 0, len(i.Roles))
	for _, mapping := range i.Roles {
		roles = append(roles, RoleMapping{PageRole: strings.ToLower(strings.TrimSpace(mapping.PageRole)), KVRole: strings.ToLower(strings.TrimSpace(mapping.KVRole))})
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
	Action     Action
	Collection string
	DocumentID bson.ObjectID
	List       kv.ListQuery
	Filter     bson.M
	Create     kv.CreateInput
	Update     kv.UpdateInput
	Eval       kv.EvalInput
}

type Result struct {
	Status  int
	Payload any
}

type RuntimeRule struct {
	Collection string                  `json:"collection"`
	Operations []application.Operation `json:"operations"`
}

type Runtime struct {
	Role               string        `json:"role"`
	IsOwnDocumentsOnly bool          `json:"isOwnDocumentsOnly"`
	Rules              []RuntimeRule `json:"rules"`
}

type RequestSummary struct {
	Requests []LoggedRequest `json:"requests"`
	Total    int64           `json:"total"`
	Denied   int64           `json:"denied"`
}
