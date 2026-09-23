package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

type MongoDB struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// ConnectMongoDB establish a connection to MongoDB and logs success to console.
func ConnectMongoDB(uri, dbName string) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return nil, fmt.Errorf("falha ao criar cliente MongoDB: %w", err)
	}

	// Ping the primary to confirm connection
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, fmt.Errorf("falha ao conectar (ping) ao MongoDB: %w", err)
	}

	log.Printf("[MongoDB] Conexão estabelecida com sucesso! (Banco: %s)", dbName)

	db := client.Database(dbName)
	return &MongoDB{
		Client:   client,
		Database: db,
	}, nil
}

// Close disconnects the MongoDB client cleanly.
func (m *MongoDB) Close(ctx context.Context) error {
	if m.Client != nil {
		return m.Client.Disconnect(ctx)
	}
	return nil
}
