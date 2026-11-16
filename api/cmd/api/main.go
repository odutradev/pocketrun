package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pocketrun-api/internal/application"
	"pocketrun-api/internal/config"
	"pocketrun-api/internal/health"
	"pocketrun-api/internal/kv"
	"pocketrun-api/internal/platform/database"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/setup"
	"pocketrun-api/internal/user"
)

const startupTimeout = 10 * time.Second

type indexer interface {
	EnsureIndexes(ctx context.Context) error
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("run api", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	startupContext, cancelStartup := context.WithTimeout(ctx, startupTimeout)
	defer cancelStartup()

	mongo, err := database.Connect(startupContext, cfg.MongoURI, cfg.MongoName)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer closeDatabase(logger, mongo)
	logger.InfoContext(ctx, "database connected", "database", cfg.MongoName)

	validate := httpx.NewValidator()
	if err := user.RegisterValidations(validate); err != nil {
		return err
	}

	userRepository := user.NewMongoRepository(mongo.Collection("users"))
	applicationRepository := application.NewMongoRepository(mongo.Collection("applications"))
	documentRepository := kv.NewMongoRepository(mongo.Collection("kvDocuments"))
	ensureIndexes(startupContext, logger, userRepository, applicationRepository, documentRepository)

	signer := user.NewTokenSigner(cfg.JWTSecret)
	userService := user.NewService(userRepository, signer)
	setupService := setup.NewService(userService, logger)
	documentService := kv.NewService(documentRepository)
	applicationService := application.NewService(applicationRepository, documentService)

	if err := setupService.ReportStatus(startupContext); err != nil {
		logger.WarnContext(ctx, "report setup status", "error", err)
	}

	healthHandler := health.NewHandler()
	userHandler := user.NewHandler(userService, validate, logger)
	setupHandler := setup.NewHandler(setupService, validate, logger)
	applicationHandler := application.NewHandler(applicationService, validate, logger)
	documentHandler := kv.NewHandler(documentService, applicationService, validate, logger)

	servers := []*http.Server{}
	if cfg.ServesPublic() {
		mux := http.NewServeMux()
		authenticateApplication := application.Authenticate(applicationService, logger)
		healthHandler.Register(mux)
		applicationHandler.RegisterPublic(mux, authenticateApplication)
		documentHandler.RegisterPublic(mux, authenticateApplication)
		servers = append(servers, httpx.NewServer(cfg.PublicPort, httpx.CORS(cfg.CORSAllowedOrigins)(mux)))
	}

	if cfg.ServesAdmin() {
		mux := http.NewServeMux()
		authenticateManager := user.Authenticate(signer)
		healthHandler.Register(mux)
		setupHandler.Register(mux)
		userHandler.Register(mux, authenticateManager)
		applicationHandler.RegisterAdmin(mux, authenticateManager)
		documentHandler.RegisterAdmin(mux, authenticateManager)
		servers = append(servers, httpx.NewServer(cfg.AdminPort, httpx.CORS(cfg.AdminCORSAllowedOrigins)(mux)))
	}

	return httpx.Serve(ctx, logger, servers)
}

func ensureIndexes(ctx context.Context, logger *slog.Logger, indexers ...indexer) {
	for _, target := range indexers {
		if err := target.EnsureIndexes(ctx); err != nil {
			logger.WarnContext(ctx, "ensure indexes", "error", err)
		}
	}
}

func closeDatabase(logger *slog.Logger, mongo *database.Mongo) {
	ctx, cancel := context.WithTimeout(context.Background(), httpx.ShutdownTimeout)
	defer cancel()

	if err := mongo.Close(ctx); err != nil {
		logger.ErrorContext(ctx, "close database", "error", err)
	}
}
