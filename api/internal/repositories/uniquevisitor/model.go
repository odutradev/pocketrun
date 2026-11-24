package uniquevisitor

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Visit struct {
	TargetID bson.ObjectID `bson:"targetId"`
	Visitor  string        `bson:"visitor"`
	At       time.Time     `bson:"at"`
}
