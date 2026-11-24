package pageaccess

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Key struct {
	ID           bson.ObjectID `json:"id" bson:"id"`
	Role         string        `json:"role" bson:"role"`
	PINHash      string        `json:"-" bson:"pinHash"`
	PINCipher    string        `json:"-" bson:"pinCipher,omitempty"`
	IsRevealable bool          `json:"isRevealable" bson:"-"`
	Secret       string        `json:"-" bson:"secret"`
	CreatedAt    time.Time     `json:"createdAt" bson:"createdAt"`
	PINUpdatedAt time.Time     `json:"pinUpdatedAt" bson:"pinUpdatedAt"`
}

type Access struct {
	PageID       bson.ObjectID `json:"pageId" bson:"_id"`
	IsEnabled    bool          `json:"isEnabled" bson:"isEnabled"`
	Keys         []Key         `json:"keys" bson:"keys"`
	SessionHours int           `json:"sessionHours" bson:"sessionHours"`
	Revision     int           `json:"-" bson:"revision"`
	Version      int           `json:"-" bson:"version"`
	UpdatedAt    *time.Time    `json:"updatedAt" bson:"updatedAt,omitempty"`
}
