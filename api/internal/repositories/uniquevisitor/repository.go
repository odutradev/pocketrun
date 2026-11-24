package uniquevisitor

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(collection *mongo.Collection) *MongoRepository {
	return &MongoRepository{collection: collection}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "targetId", Value: 1}, {Key: "visitor", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("create unique visitor indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, visit *Visit) (bool, error) {
	_, err := r.collection.InsertOne(ctx, visit)
	if mongo.IsDuplicateKeyError(err) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("insert unique visitor: %w", err)
	}
	return true, nil
}

func (r *MongoRepository) DeleteByTarget(ctx context.Context, targetID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"targetId": targetID}); err != nil {
		return fmt.Errorf("delete unique visitors: %w", err)
	}
	return nil
}
