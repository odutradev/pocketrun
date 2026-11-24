package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/services/database"
	"pocketrun-api/internal/services/httpx"
)

const startupTimeout = 10 * time.Second

func Run(ctx context.Context, logger *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	startupContext, cancelStartup := context.WithTimeout(ctx, startupTimeout)
	defer cancelStartup()

	db, err := database.Connect(startupContext, cfg.MongoURI, cfg.MongoName)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer closeDatabase(logger, db)
	logger.InfoContext(ctx, "database connected", "database", cfg.MongoName)

	validate := httpx.NewValidator()
	if err := user.RegisterValidations(validate); err != nil {
		return fmt.Errorf("register validations: %w", err)
	}

	repos := newRepositories(db)
	ensureIndexes(startupContext, logger, repos.indexers())

	accessKey, isDerived := cfg.PageAccessKey()
	if isDerived {
		logger.WarnContext(ctx, "PAGE_ACCESS_SECRET is empty, deriving the page pin key from JWT_SECRET")
	}
	s := newServices(cfg, repos, accessKey, logger)
	if err := s.setup.ReportStatus(startupContext); err != nil {
		logger.WarnContext(ctx, "report setup status", "error", err)
	}

	servers := []*http.Server{httpx.NewServer(cfg.Host, cfg.Port, newRouter(cfg, s, validate, logger))}
	return httpx.Serve(ctx, logger, servers)
}

func closeDatabase(logger *slog.Logger, db *database.Mongo) {
	ctx, cancel := context.WithTimeout(context.Background(), httpx.ShutdownTimeout)
	defer cancel()

	if err := db.Close(ctx); err != nil {
		logger.ErrorContext(ctx, "close database", "error", err)
	}
}
