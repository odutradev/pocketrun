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
	"pocketrun-api/internal/group"
	"pocketrun-api/internal/health"
	"pocketrun-api/internal/kv"
	"pocketrun-api/internal/link"
	"pocketrun-api/internal/page"
	"pocketrun-api/internal/platform/database"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/setup"
	"pocketrun-api/internal/slug"
	"pocketrun-api/internal/user"
)

const (
	startupTimeout = 10 * time.Second
	adminPrefix    = "/admin"
)

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
		return fmt.Errorf("register validations: %w", err)
	}

	userRepository := user.NewMongoRepository(mongo.Collection("users"))
	applicationRepository := application.NewMongoRepository(mongo.Collection("applications"))
	documentRepository := kv.NewMongoRepository(mongo.Collection("kvDocuments"))
	slugRepository := slug.NewMongoRepository(mongo.Collection("slugs"))
	groupRepository := group.NewMongoRepository(mongo.Collection("groups"))
	linkRepository := link.NewMongoRepository(mongo.Collection("links"))
	linkEventRepository := link.NewMongoEventRepository(mongo.Collection("linkEvents"))
	linkOpenRepository := link.NewMongoOpenRepository(mongo.Collection("linkOpens"))
	pageRepository := page.NewMongoRepository(mongo.Collection("pages"))
	pageVersionRepository := page.NewMongoVersionRepository(mongo.Collection("pageVersions"))
	pageEventRepository := page.NewMongoEventRepository(mongo.Collection("pageEvents"))
	pageOpenRepository := page.NewMongoOpenRepository(mongo.Collection("pageOpens"))
	ensureIndexes(startupContext, logger,
		userRepository, applicationRepository, documentRepository, slugRepository, groupRepository,
		linkRepository, linkEventRepository, linkOpenRepository,
		pageRepository, pageVersionRepository, pageEventRepository, pageOpenRepository,
	)

	signer := user.NewTokenSigner(cfg.JWTSecret)
	documentService := kv.NewService(documentRepository)
	applicationService := application.NewService(applicationRepository, documentService)
	userService := user.NewService(userRepository, signer, applicationService)
	setupService := setup.NewService(userService, logger)
	slugService := slug.NewService(slugRepository)
	groupService := group.NewService(groupRepository)
	linkService := link.NewService(link.Dependencies{
		Repository: linkRepository,
		Events:     linkEventRepository,
		Opens:      linkOpenRepository,
		Slugs:      slugService,
		Groups:     groupService,
		Actors:     userService,
		Logger:     logger,
	})
	pageService := page.NewService(page.Dependencies{
		Repository: pageRepository,
		Versions:   pageVersionRepository,
		Events:     pageEventRepository,
		Opens:      pageOpenRepository,
		Slugs:      slugService,
		Groups:     groupService,
		Actors:     userService,
		Logger:     logger,
	})

	if err := setupService.ReportStatus(startupContext); err != nil {
		logger.WarnContext(ctx, "report setup status", "error", err)
	}

	healthHandler := health.NewHandler()
	userHandler := user.NewHandler(userService, validate, logger)
	setupHandler := setup.NewHandler(setupService, validate, logger)
	applicationHandler := application.NewHandler(applicationService, validate, logger)
	documentHandler := kv.NewHandler(documentService, applicationService, validate, logger)
	groupHandler := group.NewHandler(groupService, validate, logger)
	pageHandler := page.NewHandler(pageService, cfg.LinksURL, validate, logger)
	linkHandler := link.NewHandler(linkService, pageHandler, cfg.LinksURL, validate, logger)

	adminMux := http.NewServeMux()
	authenticateManager := user.Authenticate(signer)
	healthHandler.Register(adminMux)
	setupHandler.Register(adminMux)
	userHandler.Register(adminMux, authenticateManager)
	applicationHandler.RegisterAdmin(adminMux, authenticateManager)
	documentHandler.RegisterAdmin(adminMux, authenticateManager)
	groupHandler.Register(adminMux, authenticateManager, "/links/groups", group.KindLinks, linkService)
	linkHandler.RegisterAdmin(adminMux, authenticateManager)
	groupHandler.Register(adminMux, authenticateManager, "/pages/groups", group.KindPages, pageService)
	pageHandler.RegisterAdmin(adminMux, authenticateManager)

	publicMux := http.NewServeMux()
	authenticateApplication := application.Authenticate(applicationService, logger)
	healthHandler.Register(publicMux)
	applicationHandler.RegisterPublic(publicMux, authenticateApplication)
	documentHandler.RegisterPublic(publicMux, authenticateApplication)
	linkHandler.RegisterPublic(publicMux)

	root := http.NewServeMux()
	root.Handle(adminPrefix+"/", http.StripPrefix(adminPrefix, httpx.CORS(cfg.AdminCORSAllowedOrigins)(adminMux)))
	root.Handle("/", httpx.CORS(cfg.CORSAllowedOrigins)(publicMux))

	servers := []*http.Server{httpx.NewServer(cfg.Host, cfg.Port, root)}
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
