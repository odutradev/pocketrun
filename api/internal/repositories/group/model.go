package group

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
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

func (g *Group) ApplyDefaults() {
	if g.Color == "" {
		g.Color = DefaultColor
	}
	if g.Icon == "" {
		g.Icon = DefaultIcon
	}
}
