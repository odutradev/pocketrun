package traffic

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type uniqueVisit struct {
	TargetID bson.ObjectID `bson:"targetId"`
	Visitor  string        `bson:"visitor"`
	At       time.Time     `bson:"at"`
}

type UniqueRegistry struct {
	collection *mongo.Collection
	key        []byte
}

func NewUniqueRegistry(collection *mongo.Collection, secret string) *UniqueRegistry {
	return &UniqueRegistry{collection: collection, key: []byte("unique-visitor:" + secret)}
}

func (r *UniqueRegistry) EnsureIndexes(ctx context.Context) error {
	_, err := r.collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "targetId", Value: 1}, {Key: "visitor", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("create unique visitor indexes: %w", err)
	}
	return nil
}

func (r *UniqueRegistry) Register(ctx context.Context, targetID bson.ObjectID, visit Visit) (bool, error) {
	_, err := r.collection.InsertOne(ctx, uniqueVisit{TargetID: targetID, Visitor: r.fingerprint(targetID, visit), At: time.Now()})
	if mongo.IsDuplicateKeyError(err) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("register unique visitor: %w", err)
	}
	return true, nil
}

func (r *UniqueRegistry) Forget(ctx context.Context, targetID bson.ObjectID) error {
	if _, err := r.collection.DeleteMany(ctx, bson.M{"targetId": targetID}); err != nil {
		return fmt.Errorf("forget unique visitors: %w", err)
	}
	return nil
}

func (r *UniqueRegistry) fingerprint(targetID bson.ObjectID, visit Visit) string {
	mac := hmac.New(sha256.New, r.key)
	mac.Write([]byte(targetID.Hex() + "|" + visit.IP + "|" + visit.UserAgent))
	return hex.EncodeToString(mac.Sum(nil))
}
