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

const (
	DefaultColor = "gray"
	DefaultIcon  = "stack"
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
	Color     string        `json:"color" bson:"color"`
	Icon      string        `json:"icon" bson:"icon"`
	CreatedAt time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt" bson:"updatedAt"`
}

type Input struct {
	Name  string `json:"name" validate:"required,max=60"`
	Color string `json:"color" validate:"omitempty,oneof=gray red orange yellow green blue purple pink"`
	Icon  string `json:"icon" validate:"omitempty,oneof=stack bookmark star heart rocket lightning globe chat calendar target archive backpack home person code magic"`
}

func (i *Input) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Color = strings.TrimSpace(i.Color)
	i.Icon = strings.TrimSpace(i.Icon)
}

func (g *Group) applyDefaults() {
	if g.Color == "" {
		g.Color = DefaultColor
	}
	if g.Icon == "" {
		g.Icon = DefaultIcon
	}
}

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidGroupID
	}
	return id, nil
}
