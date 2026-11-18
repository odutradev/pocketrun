package page

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoVersionRepository struct {
	collection *mongo.Collection
}

func NewMongoVersionRepository(collection *mongo.Collection) *MongoVersionRepository {
	return &MongoVersionRepository{collection: collection}
}

func (r *MongoVersionRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "pageId", Value: 1}, {Key: "number", Value: -1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("create page versions indexes: %w", err)
	}
	return nil
}

func (r *MongoVersionRepository) InsertVersion(ctx context.Context, version *Version) error {
	if _, err := r.collection.InsertOne(ctx, version); err != nil {
		return fmt.Errorf("insert page version: %w", err)
	}
	return nil
}

func (r *MongoVersionRepository) FindVersions(ctx context.Context, pageID bson.ObjectID) ([]Version, error) {
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

func (r *MongoVersionRepository) FindVersion(ctx context.Context, pageID bson.ObjectID, number int) (*Version, error) {
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

func (r *MongoVersionRepository) PruneVersions(ctx context.Context, pageID bson.ObjectID, keepFrom int) error {
	filter := bson.M{"pageId": pageID, "number": bson.M{"$lt": keepFrom}}
	if _, err := r.collection.DeleteMany(ctx, filter); err != nil {
		return fmt.Errorf("prune page versions: %w", err)
	}
	return nil
}

func (r *MongoVersionRepository) DeleteVersions(ctx context.Context, pageID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"pageId": pageID}); err != nil {
		return fmt.Errorf("delete page versions: %w", err)
	}
	return nil
}
