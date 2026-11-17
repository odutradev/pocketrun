package slug

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

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "kind", Value: 1}, {Key: "targetId", Value: 1}},
	})
	if err != nil {
		return fmt.Errorf("create slugs indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, entry *Entry) error {
	_, err := r.collection.InsertOne(ctx, entry)
	if mongo.IsDuplicateKeyError(err) {
		return ErrSlugTaken
	}
	if err != nil {
		return fmt.Errorf("insert slug: %w", err)
	}
	return nil
}

func (r *MongoRepository) Find(ctx context.Context, value string) (*Entry, error) {
	var entry Entry
	err := r.collection.FindOne(ctx, bson.M{"_id": value}).Decode(&entry)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrSlugNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find slug: %w", err)
	}
	return &entry, nil
}

func (r *MongoRepository) Delete(ctx context.Context, value string, targetID bson.ObjectID) error {
	if _, err := r.collection.DeleteOne(ctx, bson.M{"_id": value, "targetId": targetID}); err != nil {
		return fmt.Errorf("delete slug: %w", err)
	}
	return nil
}
