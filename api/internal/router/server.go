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
)

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
		log.Printf("[Admin API]  Operational on http://localhost:%s (Endpoints: /setup/*, /auth/*, /apps/*, /ping)", adminPort)
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
