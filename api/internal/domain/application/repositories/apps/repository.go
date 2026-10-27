package apps

import (
	"context"
	"time"

	"pocketrun-api/internal/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(mongoDatabase *database.MongoDB) *Repository {
	if mongoDatabase == nil || mongoDatabase.Database == nil {
		return &Repository{}
	}

	return &Repository{
		collection: mongoDatabase.Database.Collection("applications"),
	}
}

func (repository *Repository) VerifyOwnership(queryContext context.Context, applicationID, managerID bson.ObjectID) bool {
	matchingCount, _ := repository.collection.CountDocuments(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
	)
	return matchingCount > 0
}

func (repository *Repository) ExistsByProjectID(queryContext context.Context, projectID string) bool {
	existingCount, _ := repository.collection.CountDocuments(
		queryContext,
		bson.M{"project_id": projectID},
	)
	return existingCount > 0
}

func (repository *Repository) FindByManagerID(queryContext context.Context, managerID bson.ObjectID) ([]Application, error) {
	applicationsCursor, findError := repository.collection.Find(queryContext, bson.M{"manager_id": managerID})
	if findError != nil {
		return nil, findError
	}
	defer applicationsCursor.Close(queryContext)

	var applications []Application
	if decodeError := applicationsCursor.All(queryContext, &applications); decodeError != nil {
		return nil, decodeError
	}

	if applications == nil {
		applications = []Application{}
	}

	return applications, nil
}

func (repository *Repository) Create(queryContext context.Context, application Application) error {
	_, insertError := repository.collection.InsertOne(queryContext, application)
	return insertError
}

func (repository *Repository) FindByIDAndManager(queryContext context.Context, applicationID, managerID bson.ObjectID) (*Application, error) {
	var foundApplication Application
	findError := repository.collection.FindOne(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
	).Decode(&foundApplication)
	if findError != nil {
		return nil, findError
	}

	return &foundApplication, nil
}

func (repository *Repository) UpdateByIDAndManager(
	queryContext context.Context,
	applicationID, managerID bson.ObjectID,
	name, description string,
	allowedOrigins []string,
	allowNonBrowserRequests bool,
) (bool, error) {
	updateFields := bson.M{
		"$set": bson.M{
			"name":                        name,
			"description":                 description,
			"allowed_origins":             allowedOrigins,
			"allow_non_browser_requests": allowNonBrowserRequests,
			"updated_at":                  time.Now(),
		},
	}

	updateResult, updateError := repository.collection.UpdateOne(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
		updateFields,
	)
	if updateError != nil {
		return false, updateError
	}

	return updateResult.MatchedCount > 0, nil
}

func (repository *Repository) DeleteByIDAndManager(queryContext context.Context, applicationID, managerID bson.ObjectID) (bool, error) {
	deleteResult, deleteError := repository.collection.DeleteOne(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
	)
	if deleteError != nil {
		return false, deleteError
	}

	return deleteResult.DeletedCount > 0, nil
}

func (repository *Repository) FindByTokenHash(queryContext context.Context, tokenHash string) (*Application, error) {
	var foundApplication Application
	findError := repository.collection.FindOne(queryContext, bson.M{
		"tokens.token_hash": tokenHash,
	}).Decode(&foundApplication)
	if findError != nil {
		return nil, findError
	}

	return &foundApplication, nil
}
