package open

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"pocketrun-api/internal/services/database"
	"pocketrun-api/internal/services/traffic"
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
	if err := database.DropIndexes(ctx, r.collection, r.legacyField+"_1_at_1"); err != nil {
		return err
	}
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "targetId", Value: 1}, {Key: "at", Value: 1}}},
		{Keys: bson.D{{Key: "at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(traffic.Retention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create %s indexes: %w", r.collection.Name(), err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, open *Open) error {
	if _, err := r.collection.InsertOne(ctx, open); err != nil {
		return fmt.Errorf("insert %s: %w", r.collection.Name(), err)
	}
	return nil
}

func (r *MongoRepository) Find(ctx context.Context, targetID bson.ObjectID, from, to time.Time) ([]Open, error) {
	return r.find(ctx, bson.M{"targetId": targetID, "at": bson.M{"$gte": from, "$lt": to}})
}

func (r *MongoRepository) FindBetween(ctx context.Context, from, to time.Time) ([]Open, error) {
	return r.find(ctx, bson.M{"at": bson.M{"$gte": from, "$lt": to}})
}

func (r *MongoRepository) DeleteAll(ctx context.Context, targetID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"targetId": targetID}); err != nil {
		return fmt.Errorf("delete %s: %w", r.collection.Name(), err)
	}
	return nil
}

func (r *MongoRepository) find(ctx context.Context, filter bson.M) ([]Open, error) {
	cursor, err := r.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "at", Value: 1}}))
	if err != nil {
		return nil, fmt.Errorf("find %s: %w", r.collection.Name(), err)
	}
	defer cursor.Close(ctx)

	opens := []Open{}
	if err := cursor.All(ctx, &opens); err != nil {
		return nil, fmt.Errorf("decode %s: %w", r.collection.Name(), err)
	}
	return opens, nil
}
