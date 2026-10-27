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
	mongoURI := config.GetEnv("MONGODB_URI", "mongodb://localhost:27017")
	databaseName := config.GetEnv("MONGODB_NAME", "pocketrun")

	if mongoURI == "" || databaseName == "" {
		log.Fatalf("[MongoDB] Invalid configuration: MONGODB_URI and MONGODB_NAME are required")
	}

	connectionContext, cancelConnection := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelConnection()

	clientOptions := options.Client().ApplyURI(mongoURI)
	mongoClient, connectError := mongo.Connect(clientOptions)
	if connectError != nil {
		log.Fatalf("[MongoDB] Failed to create client: %v", connectError)
	}

	if pingError := mongoClient.Ping(connectionContext, readpref.Primary()); pingError != nil {
		log.Fatalf("[MongoDB] Failed to ping database: %v", pingError)
	}

	log.Printf("[MongoDB] Connection established successfully! (Database: %s)", databaseName)

	databaseInstance := mongoClient.Database(databaseName)
	mongoDatabase := &MongoDB{
		Client:   mongoClient,
		Database: databaseInstance,
	}

	if indexError := mongoDatabase.EnsureIndexes(connectionContext); indexError != nil {
		log.Printf("[MongoDB] Warning initializing indexes: %v", indexError)
	}

	return mongoDatabase
}

func (mongoDatabase *MongoDB) EnsureIndexes(indexContext context.Context) error {
	usersCollection := mongoDatabase.Database.Collection("users")
	_, userIndexError := usersCollection.Indexes().CreateOne(indexContext, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if userIndexError != nil {
		log.Printf("[MongoDB] Index users.email: %v", userIndexError)
	}

	applicationsCollection := mongoDatabase.Database.Collection("applications")
	_, _ = applicationsCollection.Indexes().CreateOne(indexContext, mongo.IndexModel{
		Keys: bson.D{{Key: "manager_id", Value: 1}},
	})
	_, _ = applicationsCollection.Indexes().CreateOne(indexContext, mongo.IndexModel{
		Keys:    bson.D{{Key: "project_id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	_, _ = applicationsCollection.Indexes().CreateOne(indexContext, mongo.IndexModel{
		Keys: bson.D{{Key: "tokens.token_hash", Value: 1}},
	})

	keyValueCollection := mongoDatabase.Database.Collection("kv_documents")
	_, _ = keyValueCollection.Indexes().CreateOne(indexContext, mongo.IndexModel{
		Keys: bson.D{
			{Key: "app_id", Value: 1},
			{Key: "collection_name", Value: 1},
		},
	})
	_, _ = keyValueCollection.Indexes().CreateOne(indexContext, mongo.IndexModel{
		Keys:    bson.D{{Key: "expires_at", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0),
	})

	return nil
}

func (mongoDatabase *MongoDB) Close() {
	if mongoDatabase == nil || mongoDatabase.Client == nil {
		return
	}

	disconnectContext, cancelDisconnect := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelDisconnect()

	if disconnectError := mongoDatabase.Client.Disconnect(disconnectContext); disconnectError != nil {
		log.Printf("[MongoDB] Error closing connection: %v", disconnectError)
	}
}
