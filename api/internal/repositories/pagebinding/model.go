package pagebinding

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

var ErrNotLinked = errors.New("page has no kv application")

type RoleMapping struct {
	PageRole string `json:"pageRole" bson:"pageRole" validate:"max=64"`
	KVRole   string `json:"kvRole" bson:"kvRole" validate:"max=40"`
}

type Binding struct {
	PageID        bson.ObjectID `json:"pageId" bson:"_id"`
	ApplicationID bson.ObjectID `json:"applicationId" bson:"applicationId"`
	PublicRole    string        `json:"publicRole" bson:"publicRole"`
	Roles         []RoleMapping `json:"roles" bson:"roles"`
	Revision      int           `json:"-" bson:"revision"`
	UpdatedAt     time.Time     `json:"updatedAt" bson:"updatedAt"`
}
