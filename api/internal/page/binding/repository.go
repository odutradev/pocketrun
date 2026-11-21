package binding

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

type MongoRequestRepository struct {
	collection *mongo.Collection
}

func NewMongoRequestRepository(collection *mongo.Collection) *MongoRequestRepository {
	return &MongoRequestRepository{collection: collection}
}

func (r *MongoRequestRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "pageId", Value: 1}, {Key: "at", Value: -1}}},
		{Keys: bson.D{{Key: "at", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(int32(RequestRetention.Seconds()))},
	})
	if err != nil {
		return fmt.Errorf("create page kv requests indexes: %w", err)
	}
	return nil
}

func (r *MongoRequestRepository) Insert(ctx context.Context, request *LoggedRequest) error {
	if _, err := r.collection.InsertOne(ctx, request); err != nil {
		return fmt.Errorf("insert page kv request: %w", err)
	}
	return nil
}

func (r *MongoRequestRepository) Recent(ctx context.Context, pageID bson.ObjectID, limit int) ([]LoggedRequest, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"pageId": pageID}, options.Find().SetSort(bson.D{{Key: "at", Value: -1}, {Key: "_id", Value: -1}}).SetLimit(int64(limit)))
	if err != nil {
		return nil, fmt.Errorf("find page kv requests: %w", err)
	}
	defer cursor.Close(ctx)

	requests := []LoggedRequest{}
	if err := cursor.All(ctx, &requests); err != nil {
		return nil, fmt.Errorf("decode page kv requests: %w", err)
	}
	return requests, nil
}

func (r *MongoRequestRepository) Count(ctx context.Context, pageID bson.ObjectID, since time.Time, isDenied bool) (int64, error) {
	filter := bson.M{"pageId": pageID, "at": bson.M{"$gte": since}}
	if isDenied {
		filter["status"] = bson.M{"$in": []int{401, 403, 429}}
	}
	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("count page kv requests: %w", err)
	}
	return count, nil
}

func (r *MongoRequestRepository) Moments(ctx context.Context, from, to time.Time) ([]time.Time, error) {
	cursor, err := r.collection.Find(ctx,
		bson.M{"at": bson.M{"$gte": from, "$lt": to}},
		options.Find().SetProjection(bson.M{"at": 1}).SetSort(bson.D{{Key: "at", Value: 1}}),
	)
	if err != nil {
		return nil, fmt.Errorf("find page kv request moments: %w", err)
	}
	defer cursor.Close(ctx)

	entries := []LoggedRequest{}
	if err := cursor.All(ctx, &entries); err != nil {
		return nil, fmt.Errorf("decode page kv request moments: %w", err)
	}
	moments := make([]time.Time, 0, len(entries))
	for _, entry := range entries {
		moments = append(moments, entry.At)
	}
	return moments, nil
}

func (r *MongoRequestRepository) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"pageId": pageID}); err != nil {
		return fmt.Errorf("delete page kv requests: %w", err)
	}
	return nil
}
