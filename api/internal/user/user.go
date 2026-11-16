package user

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	RoleSuperadmin = "superadmin"
	RoleAdmin      = "admin"
)

var (
	ErrUserNotFound         = errors.New("user not found")
	ErrEmailTaken           = errors.New("email already in use")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrRegistrationDisabled = errors.New("registration disabled")
	ErrSetupRequired        = errors.New("initial setup required")
	ErrInvalidToken         = errors.New("invalid token")
	ErrExpiredToken         = errors.New("token expired")
)

type User struct {
	ID           bson.ObjectID `json:"id" bson:"_id"`
	Name         string        `json:"name" bson:"name"`
	Email        string        `json:"email" bson:"email"`
	Role         string        `json:"role" bson:"role"`
	PasswordHash string        `json:"-" bson:"passwordHash"`
	CreatedAt    time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time     `json:"updatedAt" bson:"updatedAt"`
}

type CreateInput struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email,max=254"`
	Password string `json:"password" validate:"required,strongpassword"`
}

func (i *CreateInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (i *LoginInput) Normalize() {
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
}

type Session struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}
