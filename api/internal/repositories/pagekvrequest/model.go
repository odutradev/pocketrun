package pagekvrequest

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Request struct {
	ID         bson.ObjectID `json:"id" bson:"_id"`
	PageID     bson.ObjectID `json:"-" bson:"pageId"`
	Action     Action        `json:"action" bson:"action"`
	Collection string        `json:"collection" bson:"collection"`
	KVRole     string        `json:"kvRole" bson:"kvRole"`
	PageRole   string        `json:"pageRole" bson:"pageRole"`
	IsPreview  bool          `json:"isPreview" bson:"isPreview"`
	Status     int           `json:"status" bson:"status"`
	Code       string        `json:"code" bson:"code"`
	At         time.Time     `json:"at" bson:"at"`
}
