package event

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"pocketrun-api/internal/services/database"
)

type MongoRepository struct {
	collection  *mongo.Collection
	legacyField string
}

func NewMongoRepository(collection *mongo.Collection, legacyField string) *MongoRepository {
	return &MongoRepository{collection: collection, legacyField: legacyField}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	if err := database.RenameField(ctx, r.collection, r.legacyField, "targetId"); err != nil {
		return err
	}
	if err := database.DropIndexes(ctx, r.collection, r.legacyField+"_1_at_-1"); err != nil {
		return err
	}
	_, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "targetId", Value: 1}, {Key: "at", Value: -1}},
	})
	if err != nil {
		return fmt.Errorf("create %s indexes: %w", r.collection.Name(), err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, event *Event) error {
	if _, err := r.collection.InsertOne(ctx, event); err != nil {
		return fmt.Errorf("insert %s event: %w", r.collection.Name(), err)
	}
	return nil
}

func (r *MongoRepository) Count(ctx context.Context, targetID bson.ObjectID) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, bson.M{"targetId": targetID})
	if err != nil {
		return 0, fmt.Errorf("count %s: %w", r.collection.Name(), err)
	}
	return total, nil
}

func (r *MongoRepository) Find(ctx context.Context, targetID bson.ObjectID, query Query) ([]Event, error) {
	filter := bson.M{"targetId": targetID}
	if query.Before != nil {
		filter["at"] = bson.M{"$lt": *query.Before}
	}

	findOptions := options.Find().
		SetSort(bson.D{{Key: "at", Value: -1}, {Key: "_id", Value: -1}}).
		SetLimit(int64(query.Limit))

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("find %s: %w", r.collection.Name(), err)
	}
	defer cursor.Close(ctx)

	events := []Event{}
	if err := cursor.All(ctx, &events); err != nil {
		return nil, fmt.Errorf("decode %s: %w", r.collection.Name(), err)
	}
	return events, nil
}
