package group

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
	_, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "kind", Value: 1}, {Key: "name", Value: 1}},
		Options: options.Index().SetUnique(true).SetCollation(&options.Collation{Locale: "pt", Strength: 2}),
	})
	if err != nil {
		return fmt.Errorf("create groups indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) FindByKind(ctx context.Context, kind Kind) ([]Group, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"kind": kind}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, fmt.Errorf("find groups: %w", err)
	}
	defer cursor.Close(ctx)

	groups := []Group{}
	if err := cursor.All(ctx, &groups); err != nil {
		return nil, fmt.Errorf("decode groups: %w", err)
	}
	return groups, nil
}

func (r *MongoRepository) FindByID(ctx context.Context, kind Kind, id bson.ObjectID) (*Group, error) {
	var group Group
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "kind": kind}).Decode(&group)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrGroupNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find group: %w", err)
	}
	return &group, nil
}

func (r *MongoRepository) Insert(ctx context.Context, group *Group) error {
	_, err := r.collection.InsertOne(ctx, group)
	if mongo.IsDuplicateKeyError(err) {
		return ErrGroupNameTaken
	}
	if err != nil {
		return fmt.Errorf("insert group: %w", err)
	}
	return nil
}

func (r *MongoRepository) Update(ctx context.Context, kind Kind, id bson.ObjectID, input Input) (*Group, error) {
	fields := bson.M{"name": input.Name, "updatedAt": time.Now()}
	if input.Color != "" {
		fields["color"] = input.Color
	}
	if input.Icon != "" {
		fields["icon"] = input.Icon
	}

	var group Group
	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": id, "kind": kind},
		bson.M{"$set": fields},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&group)
	if mongo.IsDuplicateKeyError(err) {
		return nil, ErrGroupNameTaken
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrGroupNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("update group: %w", err)
	}
	return &group, nil
}

func (r *MongoRepository) Delete(ctx context.Context, kind Kind, id bson.ObjectID) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id, "kind": kind})
	if err != nil {
		return fmt.Errorf("delete group: %w", err)
	}

	if result.DeletedCount == 0 {
		return ErrGroupNotFound
	}
	return nil
}
