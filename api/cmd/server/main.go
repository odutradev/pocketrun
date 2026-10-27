package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/router"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func main() {
	cfg := config.Load()

	mongoDB := database.ConnectMongoDB()
	defer mongoDB.Close()

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

	var servers []*http.Server

	if cfg.APIMode == "all" || cfg.APIMode == "public" {
		publicRouter := router.NewPublicRouter(mongoDB, cfg.AllowedOrigins)
		publicAddr := fmt.Sprintf(":%s", cfg.PublicPort)
		pubSrv := &http.Server{
			Addr:    publicAddr,
			Handler: publicRouter,
		}
		servers = append(servers, pubSrv)
		log.Printf("[Public API] Operational on http://localhost:%s (Endpoints: /kv/*, /validate/*, /ping)", cfg.PublicPort)
	}

	if cfg.APIMode == "all" || cfg.APIMode == "admin" {
		adminRouter := router.NewAdminRouter(mongoDB, cfg.AdminOrigins, cfg.JWTSecret)
		adminAddr := fmt.Sprintf(":%s", cfg.AdminPort)
		admSrv := &http.Server{
			Addr:    adminAddr,
			Handler: adminRouter,
		}
		servers = append(servers, admSrv)
		log.Printf("[Admin API]  Operational on http://localhost:%s (Endpoints: /api/v1/setup/*, /api/v1/auth/*, /api/v1/apps/*, /ping)", cfg.AdminPort)
	}

	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	for _, srv := range servers {
		s := srv
		go func() {
			if err := s.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
				log.Fatalf("Server on %s failed: %v", s.Addr, err)
			}
		}()
	}

	<-stopChan
	log.Println("Shutting down PocketRun server(s)...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	var wg sync.WaitGroup
	for _, srv := range servers {
		wg.Add(1)
		s := srv
		go func() {
			defer wg.Done()
			if err := s.Shutdown(shutdownCtx); err != nil {
				log.Printf("Error shutting down server %s: %v", s.Addr, err)
			}
		}()
	}
	wg.Wait()
	log.Println("All server(s) stopped gracefully.")
}
