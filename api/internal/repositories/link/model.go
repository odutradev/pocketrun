package link

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/services/activation"
)

var (
	ErrNotFound    = errors.New("link not found")
	ErrUnavailable = errors.New("link unavailable")
)

type Link struct {
	ID        bson.ObjectID      `json:"id" bson:"_id"`
	Title     string             `json:"title" bson:"title"`
	Slug      string             `json:"slug" bson:"slug"`
	URL       string             `json:"url" bson:"url"`
	GroupID   *bson.ObjectID     `json:"groupId" bson:"groupId,omitempty"`
	Mode      activation.Mode    `json:"mode" bson:"mode"`
	StartsAt  *time.Time         `json:"startsAt" bson:"startsAt,omitempty"`
	EndsAt    *time.Time         `json:"endsAt" bson:"endsAt,omitempty"`
	MaxClicks *int64             `json:"maxClicks" bson:"maxClicks,omitempty"`
	CountBy   activation.CountBy `json:"countBy" bson:"countBy,omitempty"`
	Visitors  int64              `json:"uniqueVisitors" bson:"uniqueVisitors"`
	Clicks    int64              `json:"clicks" bson:"clicks"`
	State     activation.State   `json:"state" bson:"-"`
	CreatedBy bson.ObjectID      `json:"createdBy" bson:"createdBy"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

func (l Link) Rule() activation.Rule {
	return activation.Rule{Mode: l.Mode, StartsAt: l.StartsAt, EndsAt: l.EndsAt, MaxClicks: l.MaxClicks, CountBy: l.CountBy}
}

func (l Link) StateAt(now time.Time) activation.State {
	return l.Rule().StateAt(activation.Counts{Clicks: l.Clicks, Visitors: l.Visitors}, now)
}

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
	Links   int64          `json:"links" bson:"links"`
	Clicks  int64          `json:"clicks" bson:"clicks"`
}
