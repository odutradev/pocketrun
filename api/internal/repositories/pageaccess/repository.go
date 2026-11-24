package pageaccess

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(collection *mongo.Collection) *MongoRepository {
	return &MongoRepository{collection: collection}
}

func (r *MongoRepository) Find(ctx context.Context, pageID bson.ObjectID) (*Access, error) {
	var access Access
	err := r.collection.FindOne(ctx, bson.M{"_id": pageID}).Decode(&access)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find page access: %w", err)
	}
	if access.Keys == nil {
		access.Keys = []Key{}
	}
	return &access, nil
}

func (r *MongoRepository) Save(ctx context.Context, access *Access) error {
	expected := access.Version
	access.Version = expected + 1

	if expected == 0 {
		_, err := r.collection.InsertOne(ctx, access)
		if mongo.IsDuplicateKeyError(err) {
			return ErrConflict
		}
		if err != nil {
			return fmt.Errorf("insert page access: %w", err)
		}
		return nil
	}

	result, err := r.collection.ReplaceOne(ctx, bson.M{"_id": access.PageID, "version": expected}, access)
	if err != nil {
		return fmt.Errorf("replace page access: %w", err)
	}
	if result.MatchedCount == 0 {
		return ErrConflict
	}
	return nil
}

func (r *MongoRepository) Delete(ctx context.Context, pageID bson.ObjectID) error {
	if _, err := r.collection.DeleteOne(ctx, bson.M{"_id": pageID}); err != nil {
		return fmt.Errorf("delete page access: %w", err)
	}
	return nil
}
