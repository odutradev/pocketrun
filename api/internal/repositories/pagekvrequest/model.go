package pagekvrequest

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	Retention = 30 * 24 * time.Hour
)

type Action string

const (
	ActionList    Action = "get-all"
	ActionCount   Action = "count"
	ActionEval    Action = "eval"
	ActionGet     Action = "get"
	ActionCreate  Action = "create"
	ActionUpdate  Action = "update"
	ActionReplace Action = "replace"
	ActionDelete  Action = "delete"
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
