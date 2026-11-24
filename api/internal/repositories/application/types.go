package application

import (
	"errors"
	"strings"
)

var (
	ErrNotFound       = errors.New("application not found")
	ErrProjectIDTaken = errors.New("project id already in use")
	ErrTokenNotFound  = errors.New("token not found")
)

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

const (
	AdminRole     = "admin"
	AnyCollection = "*"
)

type Operation string

const (
	OperationRead   Operation = "read"
	OperationCreate Operation = "create"
	OperationUpdate Operation = "update"
	OperationDelete Operation = "delete"
	OperationManage Operation = "manage"
)

var (
	ErrOperationForbidden = errors.New("operation not allowed for this role")
)

type Permission struct {
	Role               string
	IsAdmin            bool
	IsOwnDocumentsOnly bool
	MaxDocuments       int
}
