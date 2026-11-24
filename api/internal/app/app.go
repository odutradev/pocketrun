package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/domains/user/utils/passwordhash"
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

	handler, err := NewHandler(startupContext, cfg, db, logger)
	if err != nil {
		return err
	}

	servers := []*http.Server{httpx.NewServer(cfg.Host, cfg.Port, handler)}
	return httpx.Serve(ctx, logger, servers)
}

func NewHandler(ctx context.Context, cfg config.Config, db *database.Mongo, logger *slog.Logger) (http.Handler, error) {
	validate := httpx.NewValidator()
	if err := passwordhash.RegisterValidations(validate); err != nil {
		return nil, fmt.Errorf("register validations: %w", err)
	}

	repos := newRepositories(db)
	ensureIndexes(ctx, logger, repos.indexers())

	s := newServices(cfg, repos, logger)
	if err := s.setup.ReportStatus(ctx); err != nil {
		logger.WarnContext(ctx, "report setup status", "error", err)
	}

	return newRouter(cfg, s, validate, logger), nil
}

func closeDatabase(logger *slog.Logger, db *database.Mongo) {
	ctx, cancel := context.WithTimeout(context.Background(), httpx.ShutdownTimeout)
	defer cancel()

	if err := db.Close(ctx); err != nil {
		logger.ErrorContext(ctx, "close database", "error", err)
	}
}
