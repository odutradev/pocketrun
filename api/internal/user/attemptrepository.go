package user

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const loginAttemptRetention = 24 * time.Hour

type LoginAttempt struct {
	ID     bson.ObjectID `bson:"_id"`
	Email  string        `bson:"email"`
	Client string        `bson:"client"`
	At     time.Time     `bson:"at"`
}

type AttemptFilter struct {
	Email  string
	Client string
	Since  time.Time
}

type MongoAttemptRepository struct {
	collection *mongo.Collection
}

func NewMongoAttemptRepository(collection *mongo.Collection) *MongoAttemptRepository {
	return &MongoAttemptRepository{collection: collection}
}

func (r *MongoAttemptRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "email", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "client", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(loginAttemptRetention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create login attempts indexes: %w", err)
	}
	return nil
}

func (r *MongoAttemptRepository) Insert(ctx context.Context, attempt *LoginAttempt) error {
	if _, err := r.collection.InsertOne(ctx, attempt); err != nil {
		return fmt.Errorf("insert login attempt: %w", err)
	}
	return nil
}

func (r *MongoAttemptRepository) Count(ctx context.Context, filter AttemptFilter) (int64, error) {
	query := bson.M{"at": bson.M{"$gte": filter.Since}}
	if filter.Email != "" {
		query["email"] = filter.Email
	}
	if filter.Client != "" {
		query["client"] = filter.Client
	}
	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return 0, fmt.Errorf("count login attempts: %w", err)
	}
	return total, nil
}

func (r *MongoAttemptRepository) DeleteByEmail(ctx context.Context, email string) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"email": email}); err != nil {
		return fmt.Errorf("delete login attempts: %w", err)
	}
	return nil
}
