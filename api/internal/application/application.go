package application

import (
	"errors"
	"strings"

	applicationrepository "pocketrun-api/internal/repositories/application"
)

const (
	DefaultTokenName         = "Default Token"
	DefaultTokenValidityDays = 365
	NewTokenName             = "New API Token"
)

var (
	ErrApplicationNotFound  = applicationrepository.ErrNotFound
	ErrProjectIDTaken       = applicationrepository.ErrProjectIDTaken
	ErrTokenNotFound        = applicationrepository.ErrTokenNotFound
	ErrMissingAccessToken   = errors.New("access token missing")
	ErrInvalidAccessToken   = errors.New("invalid access token")
	ErrExpiredAccessToken   = errors.New("access token expired")
	ErrOriginNotAllowed     = errors.New("origin not allowed")
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
