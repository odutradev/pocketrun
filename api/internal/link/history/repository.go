package history

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
		Keys: bson.D{{Key: "linkId", Value: 1}, {Key: "at", Value: -1}},
	})
	if err != nil {
		return fmt.Errorf("create link events indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, event *Event) error {
	if _, err := r.collection.InsertOne(ctx, event); err != nil {
		return fmt.Errorf("insert link event: %w", err)
	}
	return nil
}

func (r *MongoRepository) Count(ctx context.Context, linkID bson.ObjectID) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, bson.M{"linkId": linkID})
	if err != nil {
		return 0, fmt.Errorf("count link events: %w", err)
	}
	return total, nil
}

func (r *MongoRepository) Find(ctx context.Context, linkID bson.ObjectID, query Query) ([]Event, error) {
	filter := bson.M{"linkId": linkID}
	if query.Before != nil {
		filter["at"] = bson.M{"$lt": *query.Before}
	}

	findOptions := options.Find().
		SetSort(bson.D{{Key: "at", Value: -1}, {Key: "_id", Value: -1}}).
		SetLimit(int64(query.Limit))

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("find link events: %w", err)
	}
	defer cursor.Close(ctx)

	events := []Event{}
	if err := cursor.All(ctx, &events); err != nil {
		return nil, fmt.Errorf("decode link events: %w", err)
	}
	return events, nil
}
