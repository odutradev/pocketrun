package kvusage

import (
	"context"
	"fmt"
	"time"

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
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "applicationId", Value: 1}, {Key: "hour", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "managerId", Value: 1}, {Key: "hour", Value: 1}}},
		{Keys: bson.D{{Key: "hour", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(Retention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create kv usage indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Increment(ctx context.Context, applicationID, managerID bson.ObjectID, hour time.Time) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"applicationId": applicationID, "hour": hour},
		bson.M{"$inc": bson.M{"requests": 1}, "$setOnInsert": bson.M{"managerId": managerID}},
		options.UpdateOne().SetUpsert(true),
	)
	if err != nil {
		return fmt.Errorf("increment kv usage: %w", err)
	}
	return nil
}

func (r *MongoRepository) Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]Hour, error) {
	cursor, err := r.collection.Find(ctx,
		bson.M{"managerId": managerID, "hour": bson.M{"$gte": from.UTC().Truncate(time.Hour), "$lt": to}},
		options.Find().SetSort(bson.D{{Key: "hour", Value: 1}}),
	)
	if err != nil {
		return nil, fmt.Errorf("find kv usage: %w", err)
	}
	defer cursor.Close(ctx)

	hours := []Hour{}
	if err := cursor.All(ctx, &hours); err != nil {
		return nil, fmt.Errorf("decode kv usage: %w", err)
	}
	return hours, nil
}
