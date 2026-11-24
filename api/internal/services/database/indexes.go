package database

import (
	"context"
	"fmt"
	"slices"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func DropIndexes(ctx context.Context, collection *mongo.Collection, names ...string) error {
	specifications, err := collection.Indexes().ListSpecifications(ctx)
	if err != nil {
		return fmt.Errorf("list %s indexes: %w", collection.Name(), err)
	}
	for _, specification := range specifications {
		if !slices.Contains(names, specification.Name) {
			continue
		}
		if err := collection.Indexes().DropOne(ctx, specification.Name); err != nil {
			return fmt.Errorf("drop %s index %s: %w", collection.Name(), specification.Name, err)
		}
	}
	return nil
}

func RenameField(ctx context.Context, collection *mongo.Collection, from, to string) error {
	_, err := collection.UpdateMany(ctx, bson.M{from: bson.M{"$exists": true}}, bson.M{"$rename": bson.M{from: to}})
	if err != nil {
		return fmt.Errorf("rename %s.%s to %s: %w", collection.Name(), from, to, err)
	}
	return nil
}
