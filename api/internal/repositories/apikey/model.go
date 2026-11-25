package apikey

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Key struct {
	ID         bson.ObjectID `json:"id" bson:"_id"`
	UserID     bson.ObjectID `json:"userId" bson:"userId"`
	Name       string        `json:"name" bson:"name"`
	Scope      Scope         `json:"scope" bson:"scope"`
	Hash       string        `json:"-" bson:"hash"`
	Prefix     string        `json:"prefix" bson:"prefix"`
	CreatedAt  time.Time     `json:"createdAt" bson:"createdAt"`
	LastUsedAt *time.Time    `json:"lastUsedAt" bson:"lastUsedAt,omitempty"`
}
