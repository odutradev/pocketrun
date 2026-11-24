package event

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	userrepository "pocketrun-api/internal/repositories/user"
)

type Type string

type Change struct {
	Field string `json:"field" bson:"field"`
	From  any    `json:"from" bson:"from"`
	To    any    `json:"to" bson:"to"`
}

type Event struct {
	ID       bson.ObjectID        `json:"id" bson:"_id"`
	TargetID bson.ObjectID        `json:"targetId" bson:"targetId"`
	Type     Type                 `json:"type" bson:"type"`
	Actor    userrepository.Actor `json:"actor" bson:"actor"`
	Changes  []Change             `json:"changes" bson:"changes"`
	At       time.Time            `json:"at" bson:"at"`
}

type Query struct {
	Before *time.Time
	Limit  int
}
