package apikey

import (
	"context"
	"errors"
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
		{Keys: bson.D{{Key: "hash", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "userId", Value: 1}, {Key: "createdAt", Value: -1}}},
	})
	if err != nil {
		return fmt.Errorf("create api keys indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, key *Key) error {
	if _, err := r.collection.InsertOne(ctx, key); err != nil {
		return fmt.Errorf("insert api key: %w", err)
	}
	return nil
}

func (r *MongoRepository) FindByHash(ctx context.Context, hash string) (*Key, error) {
	var key Key
	err := r.collection.FindOne(ctx, bson.M{"hash": hash}).Decode(&key)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find api key: %w", err)
	}
	return &key, nil
}

func (r *MongoRepository) ListByUser(ctx context.Context, userID bson.ObjectID) ([]Key, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"userId": userID}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, fmt.Errorf("find api keys: %w", err)
	}
	defer cursor.Close(ctx)

	keys := []Key{}
	if err := cursor.All(ctx, &keys); err != nil {
		return nil, fmt.Errorf("decode api keys: %w", err)
	}
	return keys, nil
}

func (r *MongoRepository) CountByUser(ctx context.Context, userID bson.ObjectID) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, bson.M{"userId": userID})
	if err != nil {
		return 0, fmt.Errorf("count api keys: %w", err)
	}
	return total, nil
}

func (r *MongoRepository) TouchLastUsed(ctx context.Context, id bson.ObjectID, at time.Time) error {
	if _, err := r.collection.UpdateByID(ctx, id, bson.M{"$set": bson.M{"lastUsedAt": at}}); err != nil {
		return fmt.Errorf("touch api key: %w", err)
	}
	return nil
}

func (r *MongoRepository) Delete(ctx context.Context, userID, id bson.ObjectID) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id, "userId": userID})
	if err != nil {
		return fmt.Errorf("delete api key: %w", err)
	}
	if result.DeletedCount == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *MongoRepository) DeleteByUser(ctx context.Context, userID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"userId": userID}); err != nil {
		return fmt.Errorf("delete api keys of user: %w", err)
	}
	return nil
}
