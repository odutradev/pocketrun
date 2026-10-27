package router

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application"
	"pocketrun-api/internal/domain/health"
	"pocketrun-api/internal/domain/kv"
	"pocketrun-api/internal/domain/setup"
	"pocketrun-api/internal/domain/user"
	"pocketrun-api/internal/middleware/cors"
)

func NewAdminRouter(db *database.MongoDB) http.Handler {
	defaultOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "*")
	allowedOrigins := config.GetEnv("ADMIN_CORS_ALLOWED_ORIGINS", defaultOrigins)

	mux := http.NewServeMux()

	managerAuthMW := user.ManagerAuth()

	health.RegisterRoutes(mux)
	setup.RegisterRoutes(mux, db)
	user.RegisterRoutes(mux, db, managerAuthMW)
	application.RegisterRoutes(mux, db, managerAuthMW)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}

func NewPublicRouter(db *database.MongoDB) http.Handler {
	allowedOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "*")

	mux := http.NewServeMux()

	appAuthMW := application.AppAuth(db)

	health.RegisterRoutes(mux)
	kv.RegisterRoutes(mux, db, appAuthMW)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}

func StartServers(db *database.MongoDB) {
	apiMode := strings.ToLower(config.GetEnv("API_MODE", "all"))
	publicPort := config.GetEnv("PUBLIC_PORT", config.GetEnv("PORT", "8080"))
	adminPort := config.GetEnv("ADMIN_PORT", "8081")

	if apiMode != "all" && apiMode != "public" && apiMode != "admin" {
		log.Fatalf("[Router] Invalid API_MODE %q (expected all, public, or admin)", apiMode)
	}

	var servers []*http.Server

	if apiMode == "all" || apiMode == "public" {
		pubSrv := &http.Server{
			Addr:    fmt.Sprintf(":%s", publicPort),
			Handler: NewPublicRouter(db),
		}
		servers = append(servers, pubSrv)
		log.Printf("[Public API] Operational on http://localhost:%s (Endpoints: /kv/*, /validate/*, /ping)", publicPort)
	}

	if apiMode == "all" || apiMode == "admin" {
		admSrv := &http.Server{
			Addr:    fmt.Sprintf(":%s", adminPort),
			Handler: NewAdminRouter(db),
		}
		servers = append(servers, admSrv)
		log.Printf("[Admin API]  Operational on http://localhost:%s (Endpoints: /api/v1/setup/*, /api/v1/auth/*, /api/v1/apps/*, /ping)", adminPort)
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
