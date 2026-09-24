package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type MongoDB struct {
	Client   *mongo.Client
	Database *mongo.Database
}

func ConnectMongoDB(uri, dbName string) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to create MongoDB client: %w", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	log.Printf("[MongoDB] Connection established successfully! (Database: %s)", dbName)

	db := client.Database(dbName)
	mb := &MongoDB{
		Client:   client,
		Database: db,
	}

	if err := mb.EnsureIndexes(ctx); err != nil {
		log.Printf("[MongoDB] Warning initializing indexes: %v", err)
	}

	return mb, nil
}

func (m *MongoDB) EnsureIndexes(ctx context.Context) error {
	// 1. Users Collection: Unique Index on Email
	usersCol := m.Database.Collection("users")
	_, err := usersCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Printf("[MongoDB] Index users.email: %v", err)
	}

	// 2. Applications Collection: Index on manager_id, project_id, tokens.token_hash
	appsCol := m.Database.Collection("applications")
	_, _ = appsCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "manager_id", Value: 1}},
	})
	_, _ = appsCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "project_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	_, _ = appsCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "tokens.token_hash", Value: 1}},
	})

	// 3. KV Documents Collection: Compound Index on app_id + collection_name, and TTL index on expires_at
	kvCol := m.Database.Collection("kv_documents")
	_, _ = kvCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "app_id", Value: 1},
			{Key: "collection_name", Value: 1},
		},
	})
	_, _ = kvCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "expires_at", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0),
	})

	return nil
}

func (m *MongoDB) Close(ctx context.Context) error {
	if m.Client != nil {
		return m.Client.Disconnect(ctx)
	}
	return nil
}
