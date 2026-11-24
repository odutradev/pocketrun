package loginattempt

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
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "email", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "client", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(Retention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create login attempts indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, attempt *Attempt) error {
	if _, err := r.collection.InsertOne(ctx, attempt); err != nil {
		return fmt.Errorf("insert login attempt: %w", err)
	}
	return nil
}

func (r *MongoRepository) Count(ctx context.Context, filter Filter) (int64, error) {
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

func (r *MongoRepository) DeleteByEmail(ctx context.Context, email string) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"email": email}); err != nil {
		return fmt.Errorf("delete login attempts: %w", err)
	}
	return nil
}
