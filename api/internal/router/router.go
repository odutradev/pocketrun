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

func NewAdminRouter(mongoDatabase *database.MongoDB) http.Handler {
	defaultOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "*")
	allowedOrigins := config.GetEnv("ADMIN_CORS_ALLOWED_ORIGINS", defaultOrigins)

	routeMux := http.NewServeMux()

	managerAuthMiddleware := user.ManagerAuth()

	health.RegisterRoutes(routeMux)
	setup.RegisterRoutes(routeMux, mongoDatabase)
	user.RegisterRoutes(routeMux, mongoDatabase, managerAuthMiddleware)
	application.RegisterRoutes(routeMux, mongoDatabase, managerAuthMiddleware)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(routeMux)
}

func NewPublicRouter(mongoDatabase *database.MongoDB) http.Handler {
	allowedOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "*")

	routeMux := http.NewServeMux()

	applicationAuthMiddleware := application.AppAuth(mongoDatabase)

	health.RegisterRoutes(routeMux)
	kv.RegisterRoutes(routeMux, mongoDatabase, applicationAuthMiddleware)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(routeMux)
}

func buildConfiguredServers(mongoDatabase *database.MongoDB) []*http.Server {
	apiMode := strings.ToLower(config.GetEnv("API_MODE", "all"))
	publicPort := config.GetEnv("PUBLIC_PORT", config.GetEnv("PORT", "8080"))
	adminPort := config.GetEnv("ADMIN_PORT", "8081")

	if apiMode != "all" && apiMode != "public" && apiMode != "admin" {
		log.Fatalf("[Router] Invalid API_MODE %q (expected all, public, or admin)", apiMode)
	}

	var activeServers []*http.Server

	if apiMode == "all" || apiMode == "public" {
		publicServer := &http.Server{
			Addr:    fmt.Sprintf(":%s", publicPort),
			Handler: NewPublicRouter(mongoDatabase),
		}
		activeServers = append(activeServers, publicServer)
		log.Printf("[Public API] Operational on http://localhost:%s (Endpoints: /kv/*, /validate/*, /ping)", publicPort)
	}

	if apiMode == "all" || apiMode == "admin" {
		adminServer := &http.Server{
			Addr:    fmt.Sprintf(":%s", adminPort),
			Handler: NewAdminRouter(mongoDatabase),
		}
		activeServers = append(activeServers, adminServer)
		log.Printf("[Admin API]  Operational on http://localhost:%s (Endpoints: /api/v1/setup/*, /api/v1/auth/*, /api/v1/apps/*, /ping)", adminPort)
	}

	return activeServers
}

func waitForShutdownSignal() {
	shutdownSignalChannel := make(chan os.Signal, 1)
	signal.Notify(shutdownSignalChannel, os.Interrupt, syscall.SIGTERM)
	<-shutdownSignalChannel
}

func shutdownServersGracefully(activeServers []*http.Server) {
	log.Println("Shutting down PocketRun server(s)...")

	shutdownContext, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()

	var shutdownWaitGroup sync.WaitGroup
	for _, server := range activeServers {
		shutdownWaitGroup.Add(1)
		currentServer := server
		go func() {
			defer shutdownWaitGroup.Done()
			if shutdownError := currentServer.Shutdown(shutdownContext); shutdownError != nil {
				log.Printf("Error shutting down server %s: %v", currentServer.Addr, shutdownError)
			}
		}()
	}

	shutdownWaitGroup.Wait()
	log.Println("All server(s) stopped gracefully.")
}

func StartServers(mongoDatabase *database.MongoDB) {
	activeServers := buildConfiguredServers(mongoDatabase)

	for _, server := range activeServers {
		currentServer := server
		go func() {
			if listenError := currentServer.ListenAndServe(); listenError != nil && !errors.Is(listenError, http.ErrServerClosed) {
				log.Fatalf("Server on %s failed: %v", currentServer.Addr, listenError)
			}
		}()
	}

	waitForShutdownSignal()
	shutdownServersGracefully(activeServers)
}
