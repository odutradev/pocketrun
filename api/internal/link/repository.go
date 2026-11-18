package link

import (
	"context"
	"errors"
	"fmt"
	"regexp"
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
		{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "groupId", Value: 1}}},
	})
	if err != nil {
		return fmt.Errorf("create links indexes: %w", err)
	}
	return nil
}

func listFilter(query ListQuery) bson.M {
	filter := bson.M{}
	if query.GroupID != nil {
		filter["groupId"] = *query.GroupID
	}
	if query.Ungrouped {
		filter["groupId"] = nil
	}
	if query.Search != "" {
		pattern := bson.Regex{Pattern: regexp.QuoteMeta(query.Search), Options: "i"}
		filter["$or"] = bson.A{bson.M{"title": pattern}, bson.M{"slug": pattern}, bson.M{"url": pattern}}
	}
	return filter
}

func (r *MongoRepository) Find(ctx context.Context, query ListQuery) ([]Link, error) {
	findOptions := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}, {Key: "_id", Value: -1}})
	if query.Limit > 0 {
		findOptions.SetSkip(int64((max(query.Page, 1) - 1) * query.Limit)).SetLimit(int64(query.Limit))
	}

	cursor, err := r.collection.Find(ctx, listFilter(query), findOptions)
	if err != nil {
		return nil, fmt.Errorf("find links: %w", err)
	}
	defer cursor.Close(ctx)

	links := []Link{}
	if err := cursor.All(ctx, &links); err != nil {
		return nil, fmt.Errorf("decode links: %w", err)
	}
	return links, nil
}

func (r *MongoRepository) Count(ctx context.Context, query ListQuery) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, listFilter(query))
	if err != nil {
		return 0, fmt.Errorf("count links: %w", err)
	}
	return total, nil
}

func (r *MongoRepository) Totals(ctx context.Context) ([]GroupTotals, error) {
	cursor, err := r.collection.Aggregate(ctx, mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$groupId"},
			{Key: "links", Value: bson.D{{Key: "$sum", Value: 1}}},
			{Key: "clicks", Value: bson.D{{Key: "$sum", Value: "$clicks"}}},
		}}},
	})
	if err != nil {
		return nil, fmt.Errorf("aggregate link totals: %w", err)
	}
	defer cursor.Close(ctx)

	totals := []GroupTotals{}
	if err := cursor.All(ctx, &totals); err != nil {
		return nil, fmt.Errorf("decode link totals: %w", err)
	}
	return totals, nil
}

func (r *MongoRepository) FindByID(ctx context.Context, id bson.ObjectID) (*Link, error) {
	var link Link
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&link)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrLinkNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find link: %w", err)
	}
	return &link, nil
}

func (r *MongoRepository) Insert(ctx context.Context, link *Link) error {
	if _, err := r.collection.InsertOne(ctx, link); err != nil {
		return fmt.Errorf("insert link: %w", err)
	}
	return nil
}

func (r *MongoRepository) Replace(ctx context.Context, link *Link) error {
	result, err := r.collection.ReplaceOne(ctx, bson.M{"_id": link.ID}, link)
	if err != nil {
		return fmt.Errorf("replace link: %w", err)
	}

	if result.MatchedCount == 0 {
		return ErrLinkNotFound
	}
	return nil
}

func (r *MongoRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return fmt.Errorf("delete link: %w", err)
	}

	if result.DeletedCount == 0 {
		return ErrLinkNotFound
	}
	return nil
}

func (r *MongoRepository) UnsetGroup(ctx context.Context, groupID bson.ObjectID) error {
	_, err := r.collection.UpdateMany(ctx, bson.M{"groupId": groupID}, bson.M{
		"$unset": bson.M{"groupId": ""},
		"$set":   bson.M{"updatedAt": time.Now()},
	})
	if err != nil {
		return fmt.Errorf("unset links group: %w", err)
	}
	return nil
}

func (r *MongoRepository) RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time) (*Link, error) {
	filter := bson.M{
		"_id": id,
		"$or": bson.A{
			bson.M{"mode": ModeActive},
			bson.M{
				"mode":   ModePeriod,
				"endsAt": bson.M{"$gt": now},
				"$or": bson.A{
					bson.M{"startsAt": bson.M{"$exists": false}},
					bson.M{"startsAt": bson.M{"$lte": now}},
				},
			},
			bson.M{
				"mode":  ModeClicks,
				"$expr": bson.M{"$lt": bson.A{"$clicks", "$maxClicks"}},
			},
		},
	}

	var link Link
	err := r.collection.FindOneAndUpdate(ctx, filter, bson.M{"$inc": bson.M{"clicks": 1}}).Decode(&link)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrLinkUnavailable
	}
	if err != nil {
		return nil, fmt.Errorf("register link open: %w", err)
	}
	return &link, nil
}
