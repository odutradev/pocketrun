package kv

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type KVDocument struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	AppID          bson.ObjectID `bson:"app_id" json:"app_id"`
	ProjectID      string        `bson:"project_id" json:"project_id"`
	CollectionName string        `bson:"collection_name" json:"collection_name"`
	Data           bson.M        `bson:"data" json:"data"`
	ExpiresAt      *time.Time    `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	CreatedAt      time.Time     `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time     `bson:"updated_at" json:"updated_at"`
}

type CreateKVRequest struct {
	Data          map[string]interface{} `json:"data"`
	ExpiresInDays int                    `json:"expiresInDays,omitempty"`
}

type UpdateKVRequest struct {
	Data map[string]interface{} `json:"data"`
}
