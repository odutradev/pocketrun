package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"time"

	"pocketrun-api/internal/application"
	"pocketrun-api/internal/config"
	"pocketrun-api/internal/kv"
	"pocketrun-api/internal/platform/database"
	"pocketrun-api/internal/user"
)

const (
	resetTimeout  = 30 * time.Second
	adminName     = "Admin"
	adminEmail    = "admin@pocketrun.local"
	adminPassword = "1234"
)

var errProductionReset = errors.New("reset is disabled when APP_ENV is production")

type indexer interface {
	EnsureIndexes(ctx context.Context) error
}

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	withAdmin := flag.Bool("admin", false, "create a superadmin after the reset")
	flag.Parse()

	if err := run(logger, *withAdmin); err != nil {
		logger.Error("reset database", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger, withAdmin bool) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	if os.Getenv("APP_ENV") == "production" {
		return errProductionReset
	}

	ctx, cancel := context.WithTimeout(context.Background(), resetTimeout)
	defer cancel()

	mongo, err := database.Connect(ctx, cfg.MongoURI, cfg.MongoName)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer mongo.Close(ctx)

	if err := mongo.Drop(ctx); err != nil {
		return fmt.Errorf("drop database: %w", err)
	}
	logger.InfoContext(ctx, "database dropped", "database", cfg.MongoName)

	userRepository := user.NewMongoRepository(mongo.Collection("users"))
	applicationRepository := application.NewMongoRepository(mongo.Collection("applications"))
	documentRepository := kv.NewMongoRepository(mongo.Collection("kvDocuments"))
	indexers := []indexer{userRepository, applicationRepository, documentRepository}
	for _, target := range indexers {
		if err := target.EnsureIndexes(ctx); err != nil {
			return fmt.Errorf("ensure indexes: %w", err)
		}
	}

	if !withAdmin {
		return nil
	}

	applicationService := application.NewService(applicationRepository, kv.NewService(documentRepository))
	userService := user.NewService(user.Dependencies{
		Repository:   userRepository,
		Attempts:     user.NewMongoAttemptRepository(mongo.Collection("loginAttempts")),
		Signer:       user.NewTokenSigner(cfg.JWTSecret),
		Applications: applicationService,
		Logger:       logger,
	})
	input := user.CreateInput{Name: adminName, Email: adminEmail, Password: adminPassword}
	if _, err := userService.Create(ctx, input, user.RoleSuperadmin); err != nil {
		return fmt.Errorf("create superadmin: %w", err)
	}
	logger.InfoContext(ctx, "superadmin created", "email", adminEmail, "password", adminPassword)
	return nil
}
