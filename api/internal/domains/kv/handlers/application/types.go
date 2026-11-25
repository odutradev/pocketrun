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

const (
	ConfigVersion   = 1
	MaxConfigTokens = 200
)

var ErrInvalidConfig = errors.New("invalid application config")

type TokenConfigInput struct {
	ID   string `json:"id" validate:"required,max=64"`
	Role string `json:"role" validate:"required,max=40"`
}

type ConfigInput struct {
	Version                 int                `json:"version" validate:"omitempty,eq=1"`
	Name                    *string            `json:"name" validate:"omitempty,min=1,max=100"`
	Description             *string            `json:"description" validate:"omitempty,max=500"`
	AllowedOrigins          []string           `json:"allowedOrigins" validate:"omitempty,dive,required"`
	AllowNonBrowserRequests *bool              `json:"allowNonBrowserRequests"`
	Roles                   []RoleInput        `json:"roles" validate:"max=20,dive"`
	Tokens                  []TokenConfigInput `json:"tokens" validate:"max=200,dive"`
}

func (i *ConfigInput) Normalize() {
	if i.Name != nil {
		name := strings.TrimSpace(*i.Name)
		i.Name = &name
	}
	if i.Description != nil {
		description := strings.TrimSpace(*i.Description)
		i.Description = &description
	}
	for index := range i.AllowedOrigins {
		i.AllowedOrigins[index] = strings.TrimSpace(i.AllowedOrigins[index])
	}
	for index := range i.Roles {
		i.Roles[index].Normalize()
	}
	for index := range i.Tokens {
		i.Tokens[index].ID = strings.TrimSpace(i.Tokens[index].ID)
		i.Tokens[index].Role = strings.ToLower(strings.TrimSpace(i.Tokens[index].Role))
	}
}

type RoleConfig struct {
	Name               string                       `json:"name"`
	Description        string                       `json:"description"`
	IsOwnDocumentsOnly bool                         `json:"isOwnDocumentsOnly"`
	Rules              []applicationrepository.Rule `json:"rules"`
}

type TokenConfig struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

type Config struct {
	Version                 int           `json:"version"`
	ProjectID               string        `json:"projectId"`
	Name                    string        `json:"name"`
	Description             string        `json:"description"`
	AllowedOrigins          []string      `json:"allowedOrigins"`
	AllowNonBrowserRequests bool          `json:"allowNonBrowserRequests"`
	Roles                   []RoleConfig  `json:"roles"`
	Tokens                  []TokenConfig `json:"tokens"`
}

func NewConfig(app *applicationrepository.Application) Config {
	roleList := make([]RoleConfig, 0, len(app.Roles))
	for _, role := range app.Roles {
		roleList = append(roleList, RoleConfig{Name: role.Name, Description: role.Description, IsOwnDocumentsOnly: role.IsOwnDocumentsOnly, Rules: role.Rules})
	}
	tokens := make([]TokenConfig, 0, len(app.Tokens))
	for _, token := range app.Tokens {
		tokens = append(tokens, TokenConfig{ID: token.ID, Name: token.Name, Role: token.RoleName()})
	}
	origins := app.AllowedOrigins
	if origins == nil {
		origins = []string{}
	}
	return Config{
		Version:                 ConfigVersion,
		ProjectID:               app.ProjectID,
		Name:                    app.Name,
		Description:             app.Description,
		AllowedOrigins:          origins,
		AllowNonBrowserRequests: app.AllowNonBrowserRequests,
		Roles:                   roleList,
		Tokens:                  tokens,
	}
}
