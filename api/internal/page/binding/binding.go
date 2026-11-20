package binding

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/application"
	"pocketrun-api/internal/kv"
)

const (
	MaxBodyBytes      = 256 << 10
	MaxRoleMappings   = 21
	RequestRetention  = 30 * 24 * time.Hour
	RequestPageSize   = 50
	PreviewPublic     = "public"
	PreviewGeneralPIN = "pin"
	PreviewRolePrefix = "role:"
)

var (
	ErrNotLinked       = errors.New("page has no kv application")
	ErrNoAccess        = errors.New("visitor has no kv role on this page")
	ErrUnknownRoute    = errors.New("unknown kv route")
	ErrInvalidSubject  = errors.New("invalid preview subject")
	ErrInvalidMapping  = errors.New("invalid role mapping")
	ErrApplicationGone = errors.New("linked application no longer exists")
)

type Action string

const (
	ActionList    Action = "get-all"
	ActionCount   Action = "count"
	ActionEval    Action = "eval"
	ActionGet     Action = "get"
	ActionCreate  Action = "create"
	ActionUpdate  Action = "update"
	ActionReplace Action = "replace"
	ActionDelete  Action = "delete"
)

func (a Action) operation() application.Operation {
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

type RoleMapping struct {
	PageRole string `json:"pageRole" bson:"pageRole" validate:"max=64"`
	KVRole   string `json:"kvRole" bson:"kvRole" validate:"max=40"`
}

type Binding struct {
	PageID        bson.ObjectID `json:"pageId" bson:"_id"`
	ApplicationID bson.ObjectID `json:"applicationId" bson:"applicationId"`
	PublicRole    string        `json:"publicRole" bson:"publicRole"`
	Roles         []RoleMapping `json:"roles" bson:"roles"`
	Revision      int           `json:"-" bson:"revision"`
	UpdatedAt     time.Time     `json:"updatedAt" bson:"updatedAt"`
}

func (b *Binding) role(subject Subject) string {
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
	Name      string             `json:"name"`
	ProjectID string             `json:"projectId"`
	Roles     []application.Role `json:"roles"`
}

type Details struct {
	Binding     *Binding            `json:"binding"`
	Application *ApplicationSummary `json:"application"`
}

type SetInput struct {
	ApplicationID string        `json:"applicationId" validate:"required,len=24,hexadecimal"`
	PublicRole    string        `json:"publicRole" validate:"max=40"`
	Roles         []RoleMapping `json:"roles" validate:"max=21,dive"`
}

func (i *SetInput) Normalize() {
	i.ApplicationID = strings.TrimSpace(i.ApplicationID)
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

type LoggedRequest struct {
	ID         bson.ObjectID `json:"id" bson:"_id"`
	PageID     bson.ObjectID `json:"-" bson:"pageId"`
	Action     Action        `json:"action" bson:"action"`
	Collection string        `json:"collection" bson:"collection"`
	KVRole     string        `json:"kvRole" bson:"kvRole"`
	PageRole   string        `json:"pageRole" bson:"pageRole"`
	IsPreview  bool          `json:"isPreview" bson:"isPreview"`
	Status     int           `json:"status" bson:"status"`
	Code       string        `json:"code" bson:"code"`
	At         time.Time     `json:"at" bson:"at"`
}

type RequestSummary struct {
	Requests []LoggedRequest `json:"requests"`
	Total    int64           `json:"total"`
	Denied   int64           `json:"denied"`
}
