package application

import (
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/kv/utils/apptoken"
	"pocketrun-api/internal/domains/kv/utils/roles"
	applicationrepository "pocketrun-api/internal/repositories/application"
)

const (
	DefaultTokenName         = "Default Token"
	DefaultTokenValidityDays = 365
	NewTokenName             = "New API Token"
)

var (
	ErrApplicationNotFound  = applicationrepository.ErrNotFound
	ErrOperationForbidden   = applicationrepository.ErrOperationForbidden
	ErrProjectIDTaken       = applicationrepository.ErrProjectIDTaken
	ErrTokenNotFound        = applicationrepository.ErrTokenNotFound
	ErrMissingAccessToken   = apptoken.ErrMissing
	ErrInvalidAccessToken   = apptoken.ErrInvalid
	ErrExpiredAccessToken   = apptoken.ErrExpired
	ErrOriginNotAllowed     = apptoken.ErrOriginDenied
	ErrInvalidApplicationID = errors.New("invalid application id")
	ErrOwnedByPage          = errors.New("application belongs to a page")
)

type CreateInput struct {
	Name                    string   `json:"name" validate:"required,max=100"`
	ProjectID               string   `json:"projectId" validate:"required,max=64"`
	Description             string   `json:"description" validate:"max=500"`
	AllowedOrigins          []string `json:"allowedOrigins" validate:"dive,required"`
	AllowNonBrowserRequests *bool    `json:"allowNonBrowserRequests"`
}

func (i *CreateInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.ProjectID = strings.ToLower(strings.TrimSpace(i.ProjectID))
	i.Description = strings.TrimSpace(i.Description)
}

type CreateTokenInput struct {
	Name         string `json:"name" validate:"max=100"`
	ValidityDays int    `json:"validityDays" validate:"min=0,max=3650"`
	Role         string `json:"role" validate:"max=40"`
}

func (i *CreateTokenInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Role = strings.ToLower(strings.TrimSpace(i.Role))
}

type Created struct {
	Application *applicationrepository.Application `json:"application"`
	RawToken    string                             `json:"rawToken"`
}

type CreatedToken struct {
	Token    applicationrepository.Token `json:"token"`
	RawToken string                      `json:"rawToken"`
}

type AccessValidation struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	ProjectID string `json:"projectId"`
	AppName   string `json:"appName"`
	Role      string `json:"role"`
}

const (
	pageNamePrefix   = "Página "
	pageProjectIDTag = "page-"
	maxNameRunes     = 100
)

type PageInput struct {
	PageID bson.ObjectID
	Title  string
	Slug   string
}

const (
	MaxRoles            = 20
	MaxRules            = 30
	MaxDescriptionChars = 200
)

var (
	ErrRoleNotFound    = roles.ErrNotFound
	ErrRoleTaken       = errors.New("role name already used in this application")
	ErrRoleReserved    = roles.ErrReserved
	ErrInvalidRoleName = roles.ErrInvalidName
	ErrInvalidRule     = roles.ErrInvalidRule
	ErrTooManyRoles    = errors.New("application has too many roles")
	ErrRoleInUse       = errors.New("role is used by a token")
)

type RoleInput struct {
	Name               string                       `json:"name" validate:"required,max=40"`
	Description        string                       `json:"description" validate:"max=200"`
	Rules              []applicationrepository.Rule `json:"rules" validate:"required,min=1,max=30,dive"`
	IsOwnDocumentsOnly bool                         `json:"isOwnDocumentsOnly"`
}

func (i *RoleInput) Normalize() {
	i.Name = strings.ToLower(strings.TrimSpace(i.Name))
	i.Description = strings.TrimSpace(i.Description)
	i.Rules = roles.Normalize(i.Rules)
}

type RoleUpdateInput struct {
	Description        string                       `json:"description" validate:"max=200"`
	Rules              []applicationrepository.Rule `json:"rules" validate:"required,min=1,max=30,dive"`
	IsOwnDocumentsOnly bool                         `json:"isOwnDocumentsOnly"`
}

func (i *RoleUpdateInput) Normalize() {
	i.Description = strings.TrimSpace(i.Description)
	i.Rules = roles.Normalize(i.Rules)
}

type TokenRoleInput struct {
	Role string `json:"role" validate:"required,max=40"`
}

func (i *TokenRoleInput) Normalize() {
	i.Role = strings.ToLower(strings.TrimSpace(i.Role))
}
