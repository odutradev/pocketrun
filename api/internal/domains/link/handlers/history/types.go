package history

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ExpiryFinder interface {
	ExpiredAt(ctx context.Context, id bson.ObjectID) (*time.Time, error)
}
