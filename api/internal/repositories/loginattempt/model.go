package loginattempt

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Attempt struct {
	ID     bson.ObjectID `bson:"_id"`
	Email  string        `bson:"email"`
	Client string        `bson:"client"`
	At     time.Time     `bson:"at"`
}
