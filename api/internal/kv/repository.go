package kv

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
		{Keys: bson.D{{Key: "appId", Value: 1}, {Key: "collectionName", Value: 1}, {Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "appId", Value: 1}, {Key: "collectionName", Value: 1}, {Key: "createdByRole", Value: 1}, {Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "expiresAt", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(0)},
	})
	if err != nil {
		return fmt.Errorf("create documents indexes: %w", err)
	}
	return nil
}

func (r *MongoRepository) Insert(ctx context.Context, document *Document) error {
	if _, err := r.collection.InsertOne(ctx, document); err != nil {
		return fmt.Errorf("insert document: %w", err)
	}
	return nil
}

func (r *MongoRepository) InsertMany(ctx context.Context, documents []Document) (int64, error) {
	if len(documents) == 0 {
		return 0, nil
	}
	result, err := r.collection.InsertMany(ctx, documents)
	if err != nil {
		return 0, fmt.Errorf("insert documents: %w", err)
	}
	return int64(len(result.InsertedIDs)), nil
}

func (r *MongoRepository) Find(ctx context.Context, scope Scope, collectionName string, query ListQuery) ([]Document, int64, error) {
	filter := scopedFilter(scope, collectionName, query.Filter)
	findOptions := options.Find().SetSort(bson.D{{Key: query.SortField, Value: query.SortOrder}, {Key: "_id", Value: query.SortOrder}})
	if query.Paginate {
		findOptions.SetSkip(int64((query.Page - 1) * query.Limit)).SetLimit(int64(query.Limit))
	}

	documents := []Document{}
	total, err := r.findPage(ctx, filter, findOptions, &documents)
	if err != nil {
		return nil, 0, fmt.Errorf("find documents: %w", err)
	}
	return documents, total, nil
}

func (r *MongoRepository) Count(ctx context.Context, scope Scope, collectionName string, filter bson.M) (int64, error) {
	count, err := r.collection.CountDocuments(ctx, scopedFilter(scope, collectionName, filter))
	if err != nil {
		return 0, fmt.Errorf("count documents: %w", err)
	}
	return count, nil
}

func (r *MongoRepository) Aggregate(ctx context.Context, scope Scope, collectionName string, filter bson.M, stages []bson.M) ([]bson.M, error) {
	pipeline := append([]bson.M{{"$match": scopedFilter(scope, collectionName, filter)}}, stages...)
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("aggregate documents: %w", err)
	}
	defer cursor.Close(ctx)

	results := []bson.M{}
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("decode aggregation: %w", err)
	}
	return results, nil
}

func (r *MongoRepository) FindAll(ctx context.Context, scope Scope, collectionName string) ([]Document, error) {
	filter := bson.M{"appId": scope.ApplicationID}
	if collectionName != "" {
		filter = scope.filter(collectionName)
	}

	cursor, err := r.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "collectionName", Value: 1}, {Key: "createdAt", Value: 1}, {Key: "_id", Value: 1}}))
	if err != nil {
		return nil, fmt.Errorf("find all documents: %w", err)
	}
	defer cursor.Close(ctx)

	documents := []Document{}
	if err := cursor.All(ctx, &documents); err != nil {
		return nil, fmt.Errorf("decode all documents: %w", err)
	}
	return documents, nil
}

func (r *MongoRepository) FindRaw(ctx context.Context, applicationID bson.ObjectID, collectionName string, page, limit int) ([]bson.M, int64, error) {
	findOptions := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}, {Key: "_id", Value: -1}}).
		SetSkip(int64((page - 1) * limit)).
		SetLimit(int64(limit))

	documents := []bson.M{}
	total, err := r.findPage(ctx, bson.M{"appId": applicationID, "collectionName": collectionName}, findOptions, &documents)
	if err != nil {
		return nil, 0, fmt.Errorf("find raw documents: %w", err)
	}
	return documents, total, nil
}

func (r *MongoRepository) FindByID(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID) (*Document, error) {
	filter := scope.filter(collectionName)
	filter["_id"] = id

	var document Document
	err := r.collection.FindOne(ctx, filter).Decode(&document)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrDocumentNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find document: %w", err)
	}
	return &document, nil
}

func (r *MongoRepository) Update(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID, set, unset bson.M) (*Document, error) {
	filter := scope.filter(collectionName)
	filter["_id"] = id

	set["updatedAt"] = time.Now()
	update := bson.M{"$set": set}
	if len(unset) > 0 {
		update["$unset"] = unset
	}

	var document Document
	err := r.collection.FindOneAndUpdate(ctx, filter, update, options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&document)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrDocumentNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("update document: %w", err)
	}
	return &document, nil
}

func (r *MongoRepository) DeleteByID(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID) error {
	filter := scope.filter(collectionName)
	filter["_id"] = id

	result, err := r.collection.DeleteOne(ctx, filter)
	if err != nil {
		return fmt.Errorf("delete document: %w", err)
	}

	if result.DeletedCount == 0 {
		return ErrDocumentNotFound
	}
	return nil
}

func (r *MongoRepository) DeleteByCollection(ctx context.Context, scope Scope, collectionName string) (int64, error) {
	return r.deleteMany(ctx, scope.filter(collectionName))
}

func (r *MongoRepository) DeleteByApplicationID(ctx context.Context, applicationID bson.ObjectID) (int64, error) {
	return r.deleteMany(ctx, bson.M{"appId": applicationID})
}

func (r *MongoRepository) DistinctCollections(ctx context.Context, applicationID bson.ObjectID) ([]string, error) {
	collectionNames := []string{}
	err := r.collection.Distinct(ctx, "collectionName", bson.M{"appId": applicationID}).Decode(&collectionNames)
	if err != nil {
		return nil, fmt.Errorf("distinct collections: %w", err)
	}
	return collectionNames, nil
}

func (r *MongoRepository) findPage(ctx context.Context, filter bson.M, findOptions *options.FindOptionsBuilder, results any) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("count documents: %w", err)
	}

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return 0, fmt.Errorf("find documents: %w", err)
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, results); err != nil {
		return 0, fmt.Errorf("decode documents: %w", err)
	}
	return total, nil
}

func (r *MongoRepository) deleteMany(ctx context.Context, filter bson.M) (int64, error) {
	result, err := r.collection.DeleteMany(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("delete documents: %w", err)
	}
	return result.DeletedCount, nil
}

func scopedFilter(scope Scope, collectionName string, conditions bson.M) bson.M {
	filter := scope.filter(collectionName)
	for key, value := range conditions {
		filter[key] = value
	}
	return filter
}
