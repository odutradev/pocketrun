package tokens

import (
	"context"
	"time"

	"pocketrun-api/internal/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(mongoDatabase *database.MongoDB) *Repository {
	if mongoDatabase == nil || mongoDatabase.Database == nil {
		return &Repository{}
	}

	return &Repository{
		collection: mongoDatabase.Database.Collection("applications"),
	}
}

func (repository *Repository) AddToken(queryContext context.Context, applicationID, managerID bson.ObjectID, token Token) (bool, error) {
	updateResult, updateError := repository.collection.UpdateOne(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
		bson.M{"$push": bson.M{"tokens": token}},
	)
	if updateError != nil {
		return false, updateError
	}

	return updateResult.MatchedCount > 0, nil
}

func (repository *Repository) RemoveToken(queryContext context.Context, applicationID, managerID bson.ObjectID, tokenID string) (bool, error) {
	updateResult, updateError := repository.collection.UpdateOne(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
		bson.M{"$pull": bson.M{"tokens": bson.M{"id": tokenID}}},
	)
	if updateError != nil {
		return false, updateError
	}

	return updateResult.MatchedCount > 0, nil
}

func (repository *Repository) UpdateTokenLastUsedAt(queryContext context.Context, applicationID bson.ObjectID, tokenHash string) error {
	_, updateError := repository.collection.UpdateOne(
		queryContext,
		bson.M{"_id": applicationID, "tokens.token_hash": tokenHash},
		bson.M{"$set": bson.M{"tokens.$.last_used_at": time.Now()}},
	)
	return updateError
}
