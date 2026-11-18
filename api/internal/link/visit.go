package link

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/traffic"
)

type Open struct {
	ID          bson.ObjectID `bson:"_id"`
	LinkID      bson.ObjectID `bson:"linkId"`
	traffic.Hit `bson:",inline"`
}

func newOpen(linkID bson.ObjectID, visit traffic.Visit, visitor string, at time.Time) *Open {
	return &Open{ID: bson.NewObjectID(), LinkID: linkID, Hit: traffic.NewHit(visit, visitor, at)}
}
