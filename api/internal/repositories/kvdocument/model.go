package kvdocument

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

var ErrNotFound = errors.New("document not found")

type Scope struct {
	ApplicationID      bson.ObjectID
	ProjectID          string
	Role               string
	IsOwnDocumentsOnly bool
	MaxDocuments       int
}

func (s Scope) Filter(collectionName string) bson.M {
	filter := bson.M{"appId": s.ApplicationID, "collectionName": collectionName}
	if s.IsOwnDocumentsOnly {
		filter["createdByRole"] = s.Role
	}
	return filter
}

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

type ListQuery struct {
	Filter    bson.M
	SortField string
	SortOrder int
	Page      int
	Limit     int
	Paginate  bool
}
