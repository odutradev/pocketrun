package application

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
		{Keys: bson.D{{Key: "managerId", Value: 1}}},
		{Keys: bson.D{{Key: "projectId", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "tokens.tokenHash", Value: 1}}},
	})
	if err != nil {
		return fmt.Errorf("create applications indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) FindByManagerID(ctx context.Context, managerID bson.ObjectID) ([]Application, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"managerId": managerID})
	if err != nil {
		return nil, fmt.Errorf("find applications: %w", err)
	}
	defer cursor.Close(ctx)

	applications := []Application{}
	if err := cursor.All(ctx, &applications); err != nil {
		return nil, fmt.Errorf("decode applications: %w", err)
	}
	return applications, nil
}

func (r *MongoRepository) CountByManagerID(ctx context.Context, managerID bson.ObjectID) (int64, error) {
	count, err := r.collection.CountDocuments(ctx, bson.M{"managerId": managerID})
	if err != nil {
		return 0, fmt.Errorf("count applications: %w", err)
	}
	return count, nil
}

func (r *MongoRepository) Insert(ctx context.Context, application *Application) error {
	_, err := r.collection.InsertOne(ctx, application)
	if mongo.IsDuplicateKeyError(err) {
		return ErrProjectIDTaken
	}
	if err != nil {
		return fmt.Errorf("insert application: %w", err)
	}
	return nil
}

func (r *MongoRepository) FindByID(ctx context.Context, managerID, id bson.ObjectID) (*Application, error) {
	return r.findOne(ctx, bson.M{"_id": id, "managerId": managerID})
}

func (r *MongoRepository) FindByTokenHash(ctx context.Context, hash string) (*Application, error) {
	return r.findOne(ctx, bson.M{"tokens.tokenHash": hash})
}

func (r *MongoRepository) FindByObjectID(ctx context.Context, id bson.ObjectID) (*Application, error) {
	return r.findOne(ctx, bson.M{"_id": id})
}

func (r *MongoRepository) SetRoles(ctx context.Context, managerID, id bson.ObjectID, roles []Role) error {
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "managerId": managerID}, bson.M{
		"$set": bson.M{"roles": roles, "updatedAt": time.Now()},
	})
	if err != nil {
		return fmt.Errorf("set roles: %w", err)
	}
	if result.MatchedCount == 0 {
		return ErrApplicationNotFound
	}
	return nil
}

func (r *MongoRepository) SetTokenRole(ctx context.Context, managerID, id bson.ObjectID, tokenID, role string) error {
	update := bson.M{"$set": bson.M{"tokens.$.role": role}}
	if role == "" {
		update = bson.M{"$unset": bson.M{"tokens.$.role": ""}}
	}
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "managerId": managerID, "tokens.id": tokenID}, update)
	if err != nil {
		return fmt.Errorf("set token role: %w", err)
	}
	if result.MatchedCount == 0 {
		return ErrTokenNotFound
	}
	return nil
}

func (r *MongoRepository) Update(ctx context.Context, managerID, id bson.ObjectID, input UpdateInput) error {
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "managerId": managerID}, bson.M{
		"$set": bson.M{
			"name":                    input.Name,
			"description":             input.Description,
			"allowedOrigins":          input.AllowedOrigins,
			"allowNonBrowserRequests": input.AllowNonBrowserRequests,
			"updatedAt":               time.Now(),
		},
	})
	if err != nil {
		return fmt.Errorf("update application: %w", err)
	}

	if result.MatchedCount == 0 {
		return ErrApplicationNotFound
	}
	return nil
}

func (r *MongoRepository) Delete(ctx context.Context, managerID, id bson.ObjectID) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id, "managerId": managerID})
	if err != nil {
		return fmt.Errorf("delete application: %w", err)
	}

	if result.DeletedCount == 0 {
		return ErrApplicationNotFound
	}
	return nil
}

func (r *MongoRepository) AddToken(ctx context.Context, managerID, id bson.ObjectID, token Token) error {
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "managerId": managerID}, bson.M{
		"$push": bson.M{"tokens": token},
	})
	if err != nil {
		return fmt.Errorf("add token: %w", err)
	}

	if result.MatchedCount == 0 {
		return ErrApplicationNotFound
	}
	return nil
}

func (r *MongoRepository) RemoveToken(ctx context.Context, managerID, id bson.ObjectID, tokenID string) error {
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "managerId": managerID}, bson.M{
		"$pull": bson.M{"tokens": bson.M{"id": tokenID}},
	})
	if err != nil {
		return fmt.Errorf("remove token: %w", err)
	}

	if result.MatchedCount == 0 {
		return ErrApplicationNotFound
	}
	if result.ModifiedCount == 0 {
		return ErrTokenNotFound
	}
	return nil
}

func (r *MongoRepository) TouchToken(ctx context.Context, id bson.ObjectID, hash string) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id, "tokens.tokenHash": hash}, bson.M{
		"$set": bson.M{"tokens.$.lastUsedAt": time.Now()},
	})
	if err != nil {
		return fmt.Errorf("touch token: %w", err)
	}
	return nil
}

func (r *MongoRepository) findOne(ctx context.Context, filter bson.M) (*Application, error) {
	var application Application
	err := r.collection.FindOne(ctx, filter).Decode(&application)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrApplicationNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find application: %w", err)
	}
	if application.Roles == nil {
		application.Roles = []Role{}
	}
	return &application, nil
}
