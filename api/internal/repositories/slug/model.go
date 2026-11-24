package slug

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Kind string

const (
	KindLink Kind = "link"
	KindPage Kind = "page"
)

var (
	ErrTaken    = errors.New("slug already in use")
	ErrNotFound = errors.New("slug not found")
)

type Entry struct {
	Slug      string        `bson:"_id"`
	Kind      Kind          `bson:"kind"`
	TargetID  bson.ObjectID `bson:"targetId"`
	CreatedAt time.Time     `bson:"createdAt"`
}
