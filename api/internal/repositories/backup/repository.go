package backup

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type CollectionSource interface {
	Collection(name string) *mongo.Collection
}

type MongoRepository struct {
	source CollectionSource
}

func NewMongoRepository(source CollectionSource) *MongoRepository {
	return &MongoRepository{source: source}
}

func (r *MongoRepository) Count(ctx context.Context, name string) (int64, error) {
	total, err := r.source.Collection(name).EstimatedDocumentCount(ctx)
	if err != nil {
		return 0, fmt.Errorf("count %s: %w", name, err)
	}
	return total, nil
}

func (r *MongoRepository) Each(ctx context.Context, name string, visit func(document bson.Raw) error) error {
	cursor, err := r.source.Collection(name).Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "_id", Value: 1}}))
	if err != nil {
		return fmt.Errorf("find %s: %w", name, err)
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		if err := visit(cursor.Current); err != nil {
			return err
		}
	}
	if err := cursor.Err(); err != nil {
		return fmt.Errorf("read %s: %w", name, err)
	}
	return nil
}

func (r *MongoRepository) ResetStaging(ctx context.Context, name string) error {
	staging := r.source.Collection(StagingPrefix + name)
	if err := staging.Drop(ctx); err != nil {
		return fmt.Errorf("drop staging %s: %w", name, err)
	}
	if err := staging.Database().CreateCollection(ctx, StagingPrefix+name); err != nil {
		return fmt.Errorf("create staging %s: %w", name, err)
	}
	return nil
}

func (r *MongoRepository) Stage(ctx context.Context, name string, documents []any) error {
	_, err := r.source.Collection(StagingPrefix+name).InsertMany(ctx, documents)
	if mongo.IsDuplicateKeyError(err) {
		return fmt.Errorf("stage %s: %w", name, ErrDuplicateDocument)
	}
	if err != nil {
		return fmt.Errorf("stage %s: %w", name, err)
	}
	return nil
}

func (r *MongoRepository) Promote(ctx context.Context, name string) error {
	cursor, err := r.source.Collection(StagingPrefix+name).Aggregate(ctx, mongo.Pipeline{{{Key: "$out", Value: name}}})
	if err != nil {
		return fmt.Errorf("promote %s: %w", name, err)
	}
	if err := cursor.Close(ctx); err != nil {
		return fmt.Errorf("close promote %s: %w", name, err)
	}
	return nil
}

func (r *MongoRepository) DropStaging(ctx context.Context, name string) error {
	if err := r.source.Collection(StagingPrefix + name).Drop(ctx); err != nil {
		return fmt.Errorf("drop staging %s: %w", name, err)
	}
	return nil
}
