package kvdocument

import (
	"errors"

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

type ListQuery struct {
	Filter    bson.M
	SortField string
	SortOrder int
	Page      int
	Limit     int
	Paginate  bool
}
