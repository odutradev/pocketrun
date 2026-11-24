package page

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/services/activation"
)

var (
	ErrNotFound    = errors.New("page not found")
	ErrUnavailable = errors.New("page unavailable")
)

type Sort string

const (
	SortRecent   Sort = "recent"
	SortClicks   Sort = "clicks"
	SortTitle    Sort = "title"
	SortExpiring Sort = "expiring"
)

type ListQuery struct {
	GroupID   *bson.ObjectID
	Ungrouped bool
	Search    string
	State     activation.State
	Sort      Sort
	Page      int
	Limit     int
	Now       time.Time
}

type GroupTotals struct {
	GroupID *bson.ObjectID `json:"groupId" bson:"_id"`
	Pages   int64          `json:"pages" bson:"pages"`
	Clicks  int64          `json:"clicks" bson:"clicks"`
}
