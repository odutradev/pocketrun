package apikey

import (
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"

	apikeyrepository "pocketrun-api/internal/repositories/apikey"
)

const (
	keyPrefix      = "prk_"
	keyRandomBytes = 32
	visiblePrefix  = 12
)

var (
	ErrKeyNotFound   = apikeyrepository.ErrNotFound
	ErrInvalidKey    = errors.New("invalid api key")
	ErrInvalidKeyID  = errors.New("invalid api key id")
	ErrTooManyKeys   = errors.New("user has too many api keys")
	ErrInvalidUserID = errors.New("invalid user id")
)

type CreateInput struct {
	Name  string                 `json:"name" validate:"required,max=60"`
	Scope apikeyrepository.Scope `json:"scope" validate:"required,oneof=read write full"`
}

func (i *CreateInput) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
}

type Created struct {
	Key    *apikeyrepository.Key `json:"key"`
	RawKey string                `json:"rawKey"`
}

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidKeyID
	}
	return id, nil
}
