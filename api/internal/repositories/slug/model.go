package slug

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Entry struct {
	Slug      string        `bson:"_id"`
	Kind      Kind          `bson:"kind"`
	TargetID  bson.ObjectID `bson:"targetId"`
	CreatedAt time.Time     `bson:"createdAt"`
}
