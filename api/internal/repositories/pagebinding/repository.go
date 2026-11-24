package pagebinding

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
	if _, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "applicationId", Value: 1}}}); err != nil {
		return fmt.Errorf("create page bindings indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Find(ctx context.Context, pageID bson.ObjectID) (*Binding, error) {
	var found Binding
	err := r.collection.FindOne(ctx, bson.M{"_id": pageID}).Decode(&found)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotLinked
	}
	if err != nil {
		return nil, fmt.Errorf("find page binding: %w", err)
	}
	if found.Roles == nil {
		found.Roles = []RoleMapping{}
	}
	return &found, nil
}

func (r *MongoRepository) Save(ctx context.Context, binding *Binding) error {
	if binding.Roles == nil {
		binding.Roles = []RoleMapping{}
	}
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": binding.PageID}, binding, options.Replace().SetUpsert(true))
	if err != nil {
		return fmt.Errorf("save page binding: %w", err)
	}
	return nil
}

func (r *MongoRepository) Delete(ctx context.Context, pageID bson.ObjectID) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": pageID})
	if err != nil {
		return fmt.Errorf("delete page binding: %w", err)
	}
	if result.DeletedCount == 0 {
		return ErrNotLinked
	}
	return nil
}
