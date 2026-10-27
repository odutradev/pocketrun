package repositories

import (
	"context"
	"time"

	"pocketrun-api/internal/database"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type KVRepository struct {
	collection *mongo.Collection
}

func NewKVRepository(mongoDatabase *database.MongoDB) *KVRepository {
	if mongoDatabase == nil || mongoDatabase.Database == nil {
		return &KVRepository{}
	}

	return &KVRepository{
		collection: mongoDatabase.Database.Collection("kv_documents"),
	}
}

func (repository *KVRepository) Create(queryContext context.Context, document KVDocument) error {
	_, insertError := repository.collection.InsertOne(queryContext, document)
	return insertError
}

func (repository *KVRepository) FindByFilter(queryContext context.Context, queryFilter bson.M, pageNumber, pageSizeLimit int, usePagination bool) ([]KVDocument, int64, error) {
	findOptions := options.Find().SetSort(bson.M{"created_at": -1})
	if usePagination {
		documentsToSkip := int64((pageNumber - 1) * pageSizeLimit)
		findOptions.SetSkip(documentsToSkip).SetLimit(int64(pageSizeLimit))
	}

	totalDocuments, _ := repository.collection.CountDocuments(queryContext, queryFilter)

	documentsCursor, findError := repository.collection.Find(queryContext, queryFilter, findOptions)
	if findError != nil {
		return nil, 0, findError
	}
	defer documentsCursor.Close(queryContext)

	var documents []KVDocument
	if decodeError := documentsCursor.All(queryContext, &documents); decodeError != nil {
		return nil, 0, decodeError
	}

	if documents == nil {
		documents = []KVDocument{}
	}

	return documents, totalDocuments, nil
}

func (repository *KVRepository) FindByID(queryContext context.Context, applicationID bson.ObjectID, collectionName string, documentID bson.ObjectID) (*KVDocument, error) {
	var foundDocument KVDocument
	findError := repository.collection.FindOne(queryContext, bson.M{
		"_id":             documentID,
		"app_id":          applicationID,
		"collection_name": collectionName,
	}).Decode(&foundDocument)
	if findError != nil {
		return nil, findError
	}

	return &foundDocument, nil
}

func (repository *KVRepository) UpdateByID(queryContext context.Context, applicationID bson.ObjectID, collectionName string, documentID bson.ObjectID, data map[string]any) (bool, error) {
	updateFields := bson.M{
		"$set": bson.M{
			"data":       data,
			"updated_at": time.Now(),
		},
	}

	updateResult, updateError := repository.collection.UpdateOne(queryContext, bson.M{
		"_id":             documentID,
		"app_id":          applicationID,
		"collection_name": collectionName,
	}, updateFields)
	if updateError != nil {
		return false, updateError
	}

	return updateResult.MatchedCount > 0, nil
}

func (repository *KVRepository) DeleteByID(queryContext context.Context, applicationID bson.ObjectID, collectionName string, documentID bson.ObjectID) (bool, error) {
	deleteResult, deleteError := repository.collection.DeleteOne(queryContext, bson.M{
		"_id":             documentID,
		"app_id":          applicationID,
		"collection_name": collectionName,
	})
	if deleteError != nil {
		return false, deleteError
	}

	return deleteResult.DeletedCount > 0, nil
}

func (repository *KVRepository) DeleteByCollection(queryContext context.Context, applicationID bson.ObjectID, collectionName string) (int64, error) {
	deleteResult, deleteError := repository.collection.DeleteMany(queryContext, bson.M{
		"app_id":          applicationID,
		"collection_name": collectionName,
	})
	if deleteError != nil {
		return 0, deleteError
	}

	return deleteResult.DeletedCount, nil
}

func (repository *KVRepository) DeleteByAppID(queryContext context.Context, applicationID bson.ObjectID) (int64, error) {
	deleteResult, deleteError := repository.collection.DeleteMany(queryContext, bson.M{
		"app_id": applicationID,
	})
	if deleteError != nil {
		return 0, deleteError
	}

	return deleteResult.DeletedCount, nil
}

func (repository *KVRepository) FindDistinctCollectionsByAppID(queryContext context.Context, applicationID bson.ObjectID) ([]string, error) {
	var collectionNames []string
	distinctResult := repository.collection.Distinct(queryContext, "collection_name", bson.M{"app_id": applicationID})
	if decodeError := distinctResult.Decode(&collectionNames); decodeError != nil {
		return nil, decodeError
	}

	if collectionNames == nil {
		collectionNames = []string{}
	}

	return collectionNames, nil
}

func (repository *KVRepository) FindExplorerDocuments(queryContext context.Context, applicationID bson.ObjectID, collectionName string, pageNumber, pageSizeLimit int) ([]bson.M, int64, error) {
	documentsFilter := bson.M{
		"app_id":          applicationID,
		"collection_name": collectionName,
	}

	totalDocuments, _ := repository.collection.CountDocuments(queryContext, documentsFilter)

	documentsToSkip := int64((pageNumber - 1) * pageSizeLimit)
	findOptions := options.Find().SetSkip(documentsToSkip).SetLimit(int64(pageSizeLimit)).SetSort(bson.M{"created_at": -1})

	documentsCursor, findError := repository.collection.Find(queryContext, documentsFilter, findOptions)
	if findError != nil {
		return nil, 0, findError
	}
	defer documentsCursor.Close(queryContext)

	var documents []bson.M
	if decodeError := documentsCursor.All(queryContext, &documents); decodeError != nil {
		return nil, 0, decodeError
	}

	if documents == nil {
		documents = []bson.M{}
	}

	return documents, totalDocuments, nil
}
