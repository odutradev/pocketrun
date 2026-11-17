package group

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Kind string

const (
	KindLinks Kind = "links"
	KindPages Kind = "pages"
)

var (
	ErrGroupNotFound  = errors.New("group not found")
	ErrGroupNameTaken = errors.New("group name already in use")
	ErrInvalidGroupID = errors.New("invalid group id")
)

type Group struct {
	ID        bson.ObjectID `json:"id" bson:"_id"`
	Kind      Kind          `json:"kind" bson:"kind"`
	Name      string        `json:"name" bson:"name"`
	CreatedAt time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt" bson:"updatedAt"`
}

type Input struct {
	Name string `json:"name" validate:"required,max=60"`
}

func (i *Input) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
}

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidGroupID
	}
	return id, nil
}
