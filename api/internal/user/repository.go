package user

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
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("create users indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Count(ctx context.Context) (int64, error) {
	count, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return 0, fmt.Errorf("count users: %w", err)
	}
	return count, nil
}

func (r *MongoRepository) Insert(ctx context.Context, user *User) error {
	_, err := r.collection.InsertOne(ctx, user)
	if mongo.IsDuplicateKeyError(err) {
		return ErrEmailTaken
	}
	if err != nil {
		return fmt.Errorf("insert user: %w", err)
	}
	return nil
}

func (r *MongoRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
	return r.findOne(ctx, bson.M{"email": email})
}

func (r *MongoRepository) FindByID(ctx context.Context, id bson.ObjectID) (*User, error) {
	return r.findOne(ctx, bson.M{"_id": id})
}

func (r *MongoRepository) findOne(ctx context.Context, filter bson.M) (*User, error) {
	var user User
	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find user: %w", err)
	}
	return &user, nil
}

func (r *MongoRepository) FindAll(ctx context.Context) ([]User, error) {
	cursor, err := r.collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}}))
	if err != nil {
		return nil, fmt.Errorf("find users: %w", err)
	}
	defer cursor.Close(ctx)

	users := []User{}
	if err := cursor.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("decode users: %w", err)
	}
	return users, nil
}

func (r *MongoRepository) Update(ctx context.Context, id bson.ObjectID, fields bson.M) error {
	result, err := r.collection.UpdateByID(ctx, id, bson.M{"$set": fields})
	if mongo.IsDuplicateKeyError(err) {
		return ErrEmailTaken
	}
	if err != nil {
		return fmt.Errorf("update user: %w", err)
	}
	if result.MatchedCount == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (r *MongoRepository) IncrementTokenVersion(ctx context.Context, id bson.ObjectID) error {
	result, err := r.collection.UpdateByID(ctx, id, bson.M{"$inc": bson.M{"tokenVersion": 1}})
	if err != nil {
		return fmt.Errorf("increment token version: %w", err)
	}
	if result.MatchedCount == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (r *MongoRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	if result.DeletedCount == 0 {
		return ErrUserNotFound
	}
	return nil
}
