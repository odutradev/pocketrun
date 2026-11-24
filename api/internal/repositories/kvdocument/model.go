package kvdocument

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Document struct {
	ID             bson.ObjectID `json:"id" bson:"_id"`
	ApplicationID  bson.ObjectID `json:"appId" bson:"appId"`
	ProjectID      string        `json:"projectId" bson:"projectId"`
	CollectionName string        `json:"collectionName" bson:"collectionName"`
	Data           bson.M        `json:"data" bson:"data"`
	CreatedByRole  string        `json:"createdByRole,omitempty" bson:"createdByRole,omitempty"`
	ExpiresAt      *time.Time    `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
	CreatedAt      time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time     `json:"updatedAt" bson:"updatedAt"`
}
