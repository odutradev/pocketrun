package page

import (
	"fmt"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Version struct {
	ID           bson.ObjectID `json:"id" bson:"_id"`
	PageID       bson.ObjectID `json:"pageId" bson:"pageId"`
	Number       int           `json:"number" bson:"number"`
	Label        string        `json:"label" bson:"-"`
	HTML         string        `json:"html,omitempty" bson:"html,omitempty"`
	Size         int64         `json:"size" bson:"size"`
	RestoredFrom *int          `json:"restoredFrom" bson:"restoredFrom,omitempty"`
	Message      string        `json:"message" bson:"message,omitempty"`
	Actor        Actor         `json:"actor" bson:"actor"`
	CreatedAt    time.Time     `json:"createdAt" bson:"createdAt"`
}

func VersionLabel(number int) string {
	return fmt.Sprintf("1.%d", max(number, 1)-1)
}

func ParseVersionNumber(value string) (int, error) {
	number, err := strconv.Atoi(value)
	if err != nil || number < 1 {
		return 0, ErrInvalidVersion
	}
	return number, nil
}

func newVersion(pageID bson.ObjectID, number int, html, message string, restoredFrom *int, actor Actor, at time.Time) *Version {
	return &Version{
		ID:           bson.NewObjectID(),
		PageID:       pageID,
		Number:       number,
		HTML:         html,
		Size:         int64(len(html)),
		RestoredFrom: restoredFrom,
		Message:      message,
		Actor:        actor,
		CreatedAt:    at,
	}
}

func (v *Version) withLabel() *Version {
	v.Label = VersionLabel(v.Number)
	return v
}
