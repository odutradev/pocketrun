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

	"pocketrun-api/internal/platform/activation"
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

func queryTime(query ListQuery) time.Time {
	if query.Now.IsZero() {
		return time.Now()
	}
	return query.Now
}

func listFilter(query ListQuery) bson.M {
	filter := bson.M{}
	if query.GroupID != nil {
		filter["groupId"] = *query.GroupID
	}
	if query.Ungrouped {
		filter["groupId"] = nil
	}

	conditions := bson.A{}
	if query.Search != "" {
		pattern := bson.Regex{Pattern: regexp.QuoteMeta(query.Search), Options: "i"}
		conditions = append(conditions, bson.M{"$or": bson.A{bson.M{"title": pattern}, bson.M{"slug": pattern}, bson.M{"url": pattern}}})
	}
	if query.State != "" {
		conditions = append(conditions, activation.StateFilter(query.State, queryTime(query)))
	}
	if len(conditions) > 0 {
		filter["$and"] = conditions
	}
	return filter
}

func listSort(sort Sort) bson.D {
	newest := bson.D{{Key: "createdAt", Value: -1}, {Key: "_id", Value: -1}}
	switch sort {
	case SortClicks:
		return append(bson.D{{Key: "clicks", Value: -1}}, newest...)
	case SortTitle:
		return append(bson.D{{Key: "title", Value: 1}}, newest...)
	case SortExpiring:
		return append(bson.D{{Key: "expiresSort", Value: 1}}, newest...)
	default:
		return newest
	}
}

func (r *MongoRepository) Find(ctx context.Context, query ListQuery) ([]Link, error) {
	pipeline := mongo.Pipeline{{{Key: "$match", Value: listFilter(query)}}}
	if query.Sort == SortExpiring {
		upcoming := activation.UpcomingExpiry(queryTime(query))
		pipeline = append(pipeline, bson.D{{Key: "$addFields", Value: bson.D{{Key: "expiresSort", Value: upcoming}}}})
	}
	pipeline = append(pipeline, bson.D{{Key: "$sort", Value: listSort(query.Sort)}})
	if query.Limit > 0 {
		pipeline = append(pipeline,
			bson.D{{Key: "$skip", Value: int64((max(query.Page, 1) - 1) * query.Limit)}},
			bson.D{{Key: "$limit", Value: int64(query.Limit)}},
		)
	}
	if query.Sort == SortExpiring {
		pipeline = append(pipeline, bson.D{{Key: "$project", Value: bson.D{{Key: "expiresSort", Value: 0}}}})
	}

	aggregateOptions := options.Aggregate()
	if query.Sort == SortTitle {
		aggregateOptions.SetCollation(&options.Collation{Locale: "pt", Strength: 1})
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline, aggregateOptions)
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

func (r *MongoRepository) FindByIDs(ctx context.Context, ids []bson.ObjectID) ([]Link, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"_id": bson.M{"$in": ids}})
	if err != nil {
		return nil, fmt.Errorf("find links by ids: %w", err)
	}
	defer cursor.Close(ctx)

	links := []Link{}
	if err := cursor.All(ctx, &links); err != nil {
		return nil, fmt.Errorf("decode links by ids: %w", err)
	}
	return links, nil
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

func (r *MongoRepository) RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time, isCounted bool) (*Link, error) {
	filter := bson.M{"_id": id, "$or": activation.AvailableConditions(now)}

	var link Link
	var err error
	if isCounted {
		err = r.collection.FindOneAndUpdate(ctx, filter, bson.M{"$inc": bson.M{"clicks": 1}}).Decode(&link)
	} else {
		err = r.collection.FindOne(ctx, filter).Decode(&link)
	}
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrLinkUnavailable
	}
	if err != nil {
		return nil, fmt.Errorf("register link open: %w", err)
	}
	return &link, nil
}
