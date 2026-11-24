package pageversion

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	userrepository "pocketrun-api/internal/repositories/user"
)

type Version struct {
	ID           bson.ObjectID        `json:"id" bson:"_id"`
	PageID       bson.ObjectID        `json:"pageId" bson:"pageId"`
	Number       int                  `json:"number" bson:"number"`
	Label        string               `json:"label" bson:"-"`
	HTML         string               `json:"html,omitempty" bson:"html,omitempty"`
	Size         int64                `json:"size" bson:"size"`
	RestoredFrom *int                 `json:"restoredFrom" bson:"restoredFrom,omitempty"`
	Message      string               `json:"message" bson:"message,omitempty"`
	Actor        userrepository.Actor `json:"actor" bson:"actor"`
	CreatedAt    time.Time            `json:"createdAt" bson:"createdAt"`
}
