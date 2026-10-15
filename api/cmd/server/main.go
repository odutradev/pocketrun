package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/handler"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func main() {
	cfg := config.Load()

	mongoDB, err := database.ConnectMongoDB(cfg.MongoURI, cfg.MongoDBName)
	if err != nil {
		log.Printf("[MongoDB] Warning: Could not connect to database: %v", err)
	} else {
		defer func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err := mongoDB.Close(ctx); err != nil {
				log.Printf("[MongoDB] Error closing connection: %v", err)
			}
		}()

		checkCtx, checkCancel := context.WithTimeout(context.Background(), 5*time.Second)
		count, countErr := mongoDB.Database.Collection("users").CountDocuments(checkCtx, bson.M{})
		checkCancel()
		if countErr != nil {
			log.Printf("[Setup] Warning: Could not verify users count: %v", countErr)
		} else if count == 0 {
			log.Println("==================================================================")
			log.Println("  [PocketRun] INITIAL SETUP REQUIRED (Dokploy-style onboarding)  ")
			log.Println("  No users found in database. Initial setup mode is ACTIVE.       ")
			log.Println("  Access the web console to configure the initial Superadmin.     ")
			log.Println("==================================================================")
		} else {
			log.Printf("[Setup] Platform operational with %d registered manager(s).", count)
		}
	}

	router := handler.NewRouter(mongoDB, cfg.AllowedOrigins, cfg.JWTSecret)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server initializing in %s mode on http://localhost:%s", cfg.Env, cfg.Port)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

