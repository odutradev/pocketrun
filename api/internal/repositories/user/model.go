package user

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

var (
	ErrNotFound   = errors.New("user not found")
	ErrEmailTaken = errors.New("email already in use")
)

type User struct {
	ID           bson.ObjectID `json:"id" bson:"_id"`
	Name         string        `json:"name" bson:"name"`
	Email        string        `json:"email" bson:"email"`
	Role         string        `json:"role" bson:"role"`
	PasswordHash string        `json:"-" bson:"passwordHash"`
	TokenVersion int           `json:"-" bson:"tokenVersion"`
	CreatedAt    time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time     `json:"updatedAt" bson:"updatedAt"`
}

type Actor struct {
	ID    *bson.ObjectID `json:"id" bson:"id,omitempty"`
	Name  string         `json:"name" bson:"name"`
	Email string         `json:"email" bson:"email"`
}
