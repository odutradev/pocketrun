package access

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Attempt struct {
	ID     bson.ObjectID `bson:"_id"`
	PageID bson.ObjectID `bson:"pageId"`
	Client string        `bson:"client"`
	At     time.Time     `bson:"at"`
}

type MongoAttemptRepository struct {
	collection *mongo.Collection
}

func NewMongoAttemptRepository(collection *mongo.Collection) *MongoAttemptRepository {
	return &MongoAttemptRepository{collection: collection}
}

func (r *MongoAttemptRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "pageId", Value: 1}, {Key: "client", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "pageId", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(attemptRetention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create page access attempts indexes: %w", err)
	}
	return nil
}

func (r *MongoAttemptRepository) Insert(ctx context.Context, attempt *Attempt) error {
	if _, err := r.collection.InsertOne(ctx, attempt); err != nil {
		return fmt.Errorf("insert page access attempt: %w", err)
	}
	return nil
}

func (r *MongoAttemptRepository) Count(ctx context.Context, pageID bson.ObjectID, client string, since time.Time) (int64, error) {
	filter := bson.M{"pageId": pageID, "at": bson.M{"$gte": since}}
	if client != "" {
		filter["client"] = client
	}
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("count page access attempts: %w", err)
	}
	return total, nil
}

func (r *MongoAttemptRepository) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"pageId": pageID}); err != nil {
		return fmt.Errorf("delete page access attempts: %w", err)
	}
	return nil
}
