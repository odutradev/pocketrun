package analytics

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"pocketrun-api/internal/services/traffic"
)

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(collection *mongo.Collection) *MongoRepository {
	return &MongoRepository{collection: collection}
}

func (r *MongoRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "pageId", Value: 1}, {Key: "at", Value: 1}}},
		{Keys: bson.D{{Key: "at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(traffic.Retention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create page opens indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, open *Open) error {
	if _, err := r.collection.InsertOne(ctx, open); err != nil {
		return fmt.Errorf("insert page open: %w", err)
	}
	return nil
}

func (r *MongoRepository) Find(ctx context.Context, pageID bson.ObjectID, from, to time.Time) ([]Open, error) {
	return r.find(ctx, bson.M{"pageId": pageID, "at": bson.M{"$gte": from, "$lt": to}})
}

func (r *MongoRepository) FindBetween(ctx context.Context, from, to time.Time) ([]Open, error) {
	return r.find(ctx, bson.M{"at": bson.M{"$gte": from, "$lt": to}})
}

func (r *MongoRepository) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"pageId": pageID}); err != nil {
		return fmt.Errorf("delete page opens: %w", err)
	}
	return nil
}

func (r *MongoRepository) find(ctx context.Context, filter bson.M) ([]Open, error) {
	cursor, err := r.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "at", Value: 1}}))
	if err != nil {
		return nil, fmt.Errorf("find page opens: %w", err)
	}
	defer cursor.Close(ctx)

	opens := []Open{}
	if err := cursor.All(ctx, &opens); err != nil {
		return nil, fmt.Errorf("decode page opens: %w", err)
	}
	return opens, nil
}
