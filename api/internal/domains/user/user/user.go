package user

import (
	"errors"
	"strings"

	userrepository "pocketrun-api/internal/repositories/user"
)

const (
	RoleSuperadmin = "superadmin"
	RoleAdmin      = "admin"
)

var (
	ErrUserNotFound        = userrepository.ErrNotFound
	ErrEmailTaken          = userrepository.ErrEmailTaken
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrInvalidToken        = errors.New("invalid token")
	ErrExpiredToken        = errors.New("token expired")
	ErrForbidden           = errors.New("action not allowed for this role")
	ErrSelfAction          = errors.New("action not allowed on own account")
	ErrUserHasApplications = errors.New("user still owns applications")
	ErrInvalidPassword     = errors.New("current password is invalid")
	ErrInvalidUserID       = errors.New("invalid user id")
	ErrTooManyAttempts     = errors.New("too many login attempts")
)

type CreateInput struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email,max=254"`
	Password string `json:"password" validate:"required,strongpassword"`
}

func (i *CreateInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type ManageInput struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email,max=254"`
	Role     string `json:"role" validate:"required,oneof=superadmin admin"`
	Password string `json:"password" validate:"required,strongpassword"`
}

func (i *ManageInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type UpdateInput struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email,max=254"`
	Role     string `json:"role" validate:"required,oneof=superadmin admin"`
	Password string `json:"password" validate:"omitempty,strongpassword"`
}

func (i *UpdateInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type ProfileInput struct {
	Name  string `json:"name" validate:"required,min=2,max=100"`
	Email string `json:"email" validate:"required,email,max=254"`
}

func (i *ProfileInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type PasswordInput struct {
	CurrentPassword string `json:"currentPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required,strongpassword"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (i *LoginInput) Normalize() {
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type Session struct {
	Token string               `json:"-"`
	User  *userrepository.User `json:"user"`
}
