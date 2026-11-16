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
		{Keys: bson.D{{Key: "appId", Value: 1}, {Key: "collectionName", Value: 1}}},
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

func (r *MongoRepository) Find(ctx context.Context, applicationID bson.ObjectID, collectionName string, query ListQuery) ([]Document, int64, error) {
	filter := collectionFilter(applicationID, collectionName)
	for key, value := range query.Filters {
		filter["data."+key] = value
	}

	findOptions := options.Find().SetSort(bson.M{"createdAt": -1})
	if query.Paginate {
		findOptions.SetSkip(int64((query.Page - 1) * query.Limit)).SetLimit(int64(query.Limit))
	}

	documents := []Document{}
	total, err := r.findPage(ctx, filter, findOptions, &documents)
	if err != nil {
		return nil, 0, err
	}
	return documents, total, nil
}

func (r *MongoRepository) FindRaw(ctx context.Context, applicationID bson.ObjectID, collectionName string, page, limit int) ([]bson.M, int64, error) {
	findOptions := options.Find().
		SetSort(bson.M{"createdAt": -1}).
		SetSkip(int64((page - 1) * limit)).
		SetLimit(int64(limit))

	documents := []bson.M{}
	total, err := r.findPage(ctx, collectionFilter(applicationID, collectionName), findOptions, &documents)
	if err != nil {
		return nil, 0, err
	}
	return documents, total, nil
}

func (r *MongoRepository) FindByID(ctx context.Context, applicationID bson.ObjectID, collectionName string, id bson.ObjectID) (*Document, error) {
	filter := collectionFilter(applicationID, collectionName)
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

func (r *MongoRepository) UpdateData(ctx context.Context, applicationID bson.ObjectID, collectionName string, id bson.ObjectID, data map[string]any) error {
	filter := collectionFilter(applicationID, collectionName)
	filter["_id"] = id

	result, err := r.collection.UpdateOne(ctx, filter, bson.M{
		"$set": bson.M{"data": data, "updatedAt": time.Now()},
	})
	if err != nil {
		return fmt.Errorf("update document: %w", err)
	}

	if result.MatchedCount == 0 {
		return ErrDocumentNotFound
	}
	return nil
}

func (r *MongoRepository) DeleteByID(ctx context.Context, applicationID bson.ObjectID, collectionName string, id bson.ObjectID) error {
	filter := collectionFilter(applicationID, collectionName)
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

func (r *MongoRepository) DeleteByCollection(ctx context.Context, applicationID bson.ObjectID, collectionName string) (int64, error) {
	return r.deleteMany(ctx, collectionFilter(applicationID, collectionName))
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

func collectionFilter(applicationID bson.ObjectID, collectionName string) bson.M {
	return bson.M{"appId": applicationID, "collectionName": collectionName}
}
