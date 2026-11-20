package application

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	DefaultTokenName         = "Default Token"
	DefaultTokenValidityDays = 365
	NewTokenName             = "New API Token"
)

var (
	ErrApplicationNotFound  = errors.New("application not found")
	ErrProjectIDTaken       = errors.New("project id already in use")
	ErrTokenNotFound        = errors.New("token not found")
	ErrMissingAccessToken   = errors.New("access token missing")
	ErrInvalidAccessToken   = errors.New("invalid access token")
	ErrExpiredAccessToken   = errors.New("access token expired")
	ErrOriginNotAllowed     = errors.New("origin not allowed")
	ErrInvalidApplicationID = errors.New("invalid application id")
	ErrOwnedByPage          = errors.New("application belongs to a page")
)

type Application struct {
	ID                      bson.ObjectID  `json:"id" bson:"_id"`
	ManagerID               bson.ObjectID  `json:"managerId" bson:"managerId"`
	PageID                  *bson.ObjectID `json:"pageId" bson:"pageId,omitempty"`
	Name                    string         `json:"name" bson:"name"`
	ProjectID               string         `json:"projectId" bson:"projectId"`
	Description             string         `json:"description" bson:"description"`
	AllowedOrigins          []string       `json:"allowedOrigins" bson:"allowedOrigins"`
	AllowNonBrowserRequests bool           `json:"allowNonBrowserRequests" bson:"allowNonBrowserRequests"`
	Tokens                  []Token        `json:"tokens,omitempty" bson:"tokens"`
	Roles                   []Role         `json:"roles" bson:"roles"`
	CreatedAt               time.Time      `json:"createdAt" bson:"createdAt"`
	UpdatedAt               time.Time      `json:"updatedAt" bson:"updatedAt"`
}

type Token struct {
	ID         string     `json:"id" bson:"id"`
	Name       string     `json:"name" bson:"name"`
	Hash       string     `json:"-" bson:"tokenHash"`
	Prefix     string     `json:"tokenPrefix" bson:"tokenPrefix"`
	Role       string     `json:"role" bson:"role,omitempty"`
	ExpiresAt  *time.Time `json:"expiresAt" bson:"expiresAt,omitempty"`
	CreatedAt  time.Time  `json:"createdAt" bson:"createdAt"`
	LastUsedAt *time.Time `json:"lastUsedAt" bson:"lastUsedAt,omitempty"`
}

func (t Token) IsExpired(now time.Time) bool {
	return t.ExpiresAt != nil && now.After(*t.ExpiresAt)
}

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

type UpdateInput struct {
	Name                    string   `json:"name" validate:"required,max=100"`
	Description             string   `json:"description" validate:"max=500"`
	AllowedOrigins          []string `json:"allowedOrigins" validate:"dive,required"`
	AllowNonBrowserRequests bool     `json:"allowNonBrowserRequests"`
}

func (i *UpdateInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
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
	Application *Application `json:"application"`
	RawToken    string       `json:"rawToken"`
}

type CreatedToken struct {
	Token    Token  `json:"token"`
	RawToken string `json:"rawToken"`
}

type AccessValidation struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	ProjectID string `json:"projectId"`
	AppName   string `json:"appName"`
	Role      string `json:"role"`
}
