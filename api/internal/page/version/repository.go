package version

import (
	"context"
	"errors"
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
		Keys:    bson.D{{Key: "pageId", Value: 1}, {Key: "number", Value: -1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("create page versions indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, version *Version) error {
	if _, err := r.collection.InsertOne(ctx, version); err != nil {
		return fmt.Errorf("insert page version: %w", err)
	}
	return nil
}

func (r *MongoRepository) Find(ctx context.Context, pageID bson.ObjectID) ([]Version, error) {
	findOptions := options.Find().
		SetSort(bson.D{{Key: "number", Value: -1}}).
		SetProjection(bson.D{{Key: "html", Value: 0}})

	cursor, err := r.collection.Find(ctx, bson.M{"pageId": pageID}, findOptions)
	if err != nil {
		return nil, fmt.Errorf("find page versions: %w", err)
	}
	defer cursor.Close(ctx)

	versions := []Version{}
	if err := cursor.All(ctx, &versions); err != nil {
		return nil, fmt.Errorf("decode page versions: %w", err)
	}
	return versions, nil
}

func (r *MongoRepository) FindOne(ctx context.Context, pageID bson.ObjectID, number int) (*Version, error) {
	var version Version
	err := r.collection.FindOne(ctx, bson.M{"pageId": pageID, "number": number}).Decode(&version)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrVersionNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find page version: %w", err)
	}
	return &version, nil
}

func (r *MongoRepository) Prune(ctx context.Context, pageID bson.ObjectID, keepFrom int) error {
	filter := bson.M{"pageId": pageID, "number": bson.M{"$lt": keepFrom}}
	if _, err := r.collection.DeleteMany(ctx, filter); err != nil {
		return fmt.Errorf("prune page versions: %w", err)
	}
	return nil
}

func (r *MongoRepository) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"pageId": pageID}); err != nil {
		return fmt.Errorf("delete page versions: %w", err)
	}
	return nil
}
