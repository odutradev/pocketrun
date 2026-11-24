package group

import (
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"

	grouprepository "pocketrun-api/internal/repositories/group"
)

var (
	ErrGroupNotFound  = grouprepository.ErrNotFound
	ErrGroupNameTaken = grouprepository.ErrNameTaken
	ErrInvalidGroupID = errors.New("invalid group id")
)

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidGroupID
	}
	return id, nil
}
