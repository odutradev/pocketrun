package database

import (
	"context"
	"log"
	"time"

	"pocketrun-api/internal/config"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type MongoDB struct {
	Client   *mongo.Client
	Database *mongo.Database
}

func ConnectMongoDB() *MongoDB {
	uri := config.GetEnv("MONGODB_URI", "mongodb://localhost:27017")
	dbName := config.GetEnv("MONGODB_NAME", "pocketrun")

	if uri == "" || dbName == "" {
		log.Fatalf("[MongoDB] Invalid configuration: MONGODB_URI and MONGODB_NAME are required")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		log.Fatalf("[MongoDB] Failed to create client: %v", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatalf("[MongoDB] Failed to ping database: %v", err)
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

	return mb
}

func (m *MongoDB) EnsureIndexes(ctx context.Context) error {
	usersCol := m.Database.Collection("users")
	_, err := usersCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Printf("[MongoDB] Index users.email: %v", err)
	}

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

func (m *MongoDB) Close() {
	if m == nil || m.Client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := m.Client.Disconnect(ctx); err != nil {
		log.Printf("[MongoDB] Error closing connection: %v", err)
	}
}
