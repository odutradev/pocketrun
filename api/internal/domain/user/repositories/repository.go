package repositories

import (
	"context"

	"pocketrun-api/internal/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(mongoDatabase *database.MongoDB) *UserRepository {
	if mongoDatabase == nil || mongoDatabase.Database == nil {
		return &UserRepository{}
	}

	return &UserRepository{
		collection: mongoDatabase.Database.Collection("users"),
	}
}

func (repository *UserRepository) IsAvailable() bool {
	return repository != nil && repository.collection != nil
}

func (repository *UserRepository) CountUsers(queryContext context.Context) (int64, error) {
	return repository.collection.CountDocuments(queryContext, bson.M{})
}

func (repository *UserRepository) Create(queryContext context.Context, newUser User) error {
	_, insertError := repository.collection.InsertOne(queryContext, newUser)
	return insertError
}

func (repository *UserRepository) FindByEmail(queryContext context.Context, email string) (*User, error) {
	var foundUser User
	if findError := repository.collection.FindOne(queryContext, bson.M{"email": email}).Decode(&foundUser); findError != nil {
		return nil, findError
	}

	return &foundUser, nil
}

func (repository *UserRepository) FindByID(queryContext context.Context, userID bson.ObjectID) (*User, error) {
	var foundUser User
	if findError := repository.collection.FindOne(queryContext, bson.M{"_id": userID}).Decode(&foundUser); findError != nil {
		return nil, findError
	}

	return &foundUser, nil
}
