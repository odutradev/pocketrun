package kvusage

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	Retention = 400 * 24 * time.Hour
)

type Hour struct {
	ApplicationID bson.ObjectID `bson:"applicationId"`
	ManagerID     bson.ObjectID `bson:"managerId"`
	Hour          time.Time     `bson:"hour"`
	Requests      int64         `bson:"requests"`
}
