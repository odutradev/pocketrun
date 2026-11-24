package pageaccessattempt

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const Retention = 24 * time.Hour

type Attempt struct {
	ID     bson.ObjectID `bson:"_id"`
	PageID bson.ObjectID `bson:"pageId"`
	Client string        `bson:"client"`
	At     time.Time     `bson:"at"`
}
