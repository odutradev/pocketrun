package open

import (
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/services/traffic"
)

type Open struct {
	ID          bson.ObjectID `bson:"_id"`
	TargetID    bson.ObjectID `bson:"targetId"`
	traffic.Hit `bson:",inline"`
}
