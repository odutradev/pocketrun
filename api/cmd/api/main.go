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
	linkanalytics "pocketrun-api/internal/link/analytics"
	linkhistory "pocketrun-api/internal/link/history"
	"pocketrun-api/internal/link/link"
	linkpublic "pocketrun-api/internal/link/public"
	"pocketrun-api/internal/overview"
	"pocketrun-api/internal/page/access"
	pageanalytics "pocketrun-api/internal/page/analytics"
	"pocketrun-api/internal/page/binding"
	pagehistory "pocketrun-api/internal/page/history"
	"pocketrun-api/internal/page/page"
	pagepublic "pocketrun-api/internal/page/public"
	"pocketrun-api/internal/page/version"
	"pocketrun-api/internal/platform/database"
	"pocketrun-api/internal/platform/httpx"
	"pocketrun-api/internal/platform/traffic"
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
	loginAttemptRepository := user.NewMongoAttemptRepository(mongo.Collection("loginAttempts"))
	applicationRepository := application.NewMongoRepository(mongo.Collection("applications"))
	documentRepository := kv.NewMongoRepository(mongo.Collection("kvDocuments"))
	uniqueRegistry := traffic.NewUniqueRegistry(mongo.Collection("uniqueVisitors"), cfg.JWTSecret)
	usageRepository := kv.NewMongoUsageRepository(mongo.Collection("kvUsage"))
	slugRepository := slug.NewMongoRepository(mongo.Collection("slugs"))
	groupRepository := group.NewMongoRepository(mongo.Collection("groups"))
	linkRepository := link.NewMongoRepository(mongo.Collection("links"))
	linkEventRepository := linkhistory.NewMongoRepository(mongo.Collection("linkEvents"))
	linkOpenRepository := linkanalytics.NewMongoRepository(mongo.Collection("linkOpens"))
	pageRepository := page.NewMongoRepository(mongo.Collection("pages"))
	pageVersionRepository := version.NewMongoRepository(mongo.Collection("pageVersions"))
	pageEventRepository := pagehistory.NewMongoRepository(mongo.Collection("pageEvents"))
	pageOpenRepository := pageanalytics.NewMongoRepository(mongo.Collection("pageOpens"))
	accessRepository := access.NewMongoRepository(mongo.Collection("pageAccess"))
	accessAttemptRepository := access.NewMongoAttemptRepository(mongo.Collection("pageAccessAttempts"))
	bindingRepository := binding.NewMongoRepository(mongo.Collection("pageBindings"))
	bindingRequestRepository := binding.NewMongoRequestRepository(mongo.Collection("pageKvRequests"))
	ensureIndexes(startupContext, logger,
		userRepository, loginAttemptRepository, applicationRepository, documentRepository, usageRepository, uniqueRegistry, slugRepository, groupRepository,
		linkRepository, linkEventRepository, linkOpenRepository,
		pageRepository, pageVersionRepository, pageEventRepository, pageOpenRepository, accessAttemptRepository,
		bindingRepository, bindingRequestRepository,
	)

	signer := user.NewTokenSigner(cfg.JWTSecret)
	documentService := kv.NewService(documentRepository)
	usageService := kv.NewUsageService(usageRepository, logger)
	applicationService := application.NewService(applicationRepository, documentService)
	userService := user.NewService(user.Dependencies{
		Repository:   userRepository,
		Attempts:     loginAttemptRepository,
		Signer:       signer,
		Applications: applicationService,
		Logger:       logger,
	})
	setupService := setup.NewService(userService, logger)
	slugService := slug.NewService(slugRepository)
	groupService := group.NewService(groupRepository)
	linkHistoryService := linkhistory.NewService(linkEventRepository, logger)
	linkAnalyticsService := linkanalytics.NewService(linkOpenRepository, logger)
	linkService := link.NewService(link.Dependencies{
		Repository: linkRepository,
		History:    linkHistoryService,
		Opens:      linkAnalyticsService,
		Uniques:    uniqueRegistry,
		Slugs:      slugService,
		Groups:     groupService,
		Actors:     userService,
		Logger:     logger,
	})
	versionService := version.NewService(pageVersionRepository, logger)
	pageHistoryService := pagehistory.NewService(pageEventRepository, logger)
	pageAnalyticsService := pageanalytics.NewService(pageOpenRepository, logger)
	accessSecret := cfg.PageAccessSecret
	if accessSecret == "" {
		logger.WarnContext(ctx, "PAGE_ACCESS_SECRET is empty, deriving the page pin key from JWT_SECRET")
		accessSecret = "page-access:" + cfg.JWTSecret
	}
	accessService := access.NewService(access.Dependencies{
		Repository: accessRepository,
		Attempts:   accessAttemptRepository,
		History:    pageHistoryService,
		Actors:     userService,
		Secret:     accessSecret,
		Logger:     logger,
	})
	bindingService := binding.NewService(binding.Dependencies{
		Repository:   bindingRepository,
		Requests:     bindingRequestRepository,
		Applications: applicationService,
		Access:       accessService,
		Documents:    documentService,
		Usage:        usageService,
		History:      pageHistoryService,
		Actors:       userService,
		Logger:       logger,
	})
	pageService := page.NewService(page.Dependencies{
		Repository: pageRepository,
		Versions:   versionService,
		History:    pageHistoryService,
		Opens:      pageAnalyticsService,
		Uniques:    uniqueRegistry,
		Access:     accessService,
		Bindings:   bindingService,
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
	documentHandler := kv.NewHandler(documentService, applicationService, usageService, validate, logger)
	groupHandler := group.NewHandler(groupService, validate, logger)
	linkHandler := link.NewHandler(linkService, cfg.LinksURL, validate, logger)
	linkHistoryHandler := linkhistory.NewHandler(linkHistoryService, linkService, validate, logger)
	linkAnalyticsHandler := linkanalytics.NewHandler(linkAnalyticsService, linkService, validate, logger)
	pageHandler := page.NewHandler(pageService, validate, logger)
	versionHandler := version.NewHandler(versionService, pageService, logger)
	pageHistoryHandler := pagehistory.NewHandler(pageHistoryService, pageService, validate, logger)
	pageAnalyticsHandler := pageanalytics.NewHandler(pageAnalyticsService, pageService, validate, logger)
	accessHandler := access.NewHandler(accessService, pageService, validate, logger)
	overviewService := overview.NewService(overview.Dependencies{Pages: pageAnalyticsService, Links: linkAnalyticsService, KV: usageService})
	overviewHandler := overview.NewHandler(overviewService, validate, logger)
	bindingHandler := binding.NewHandler(bindingService, pageService, validate, logger)
	pagePublicHandler := pagepublic.NewHandler(pagepublic.Dependencies{
		Pages:    pageService,
		Guard:    accessService,
		Data:     bindingService,
		PagesURL: cfg.LinksURL,
		Validate: validate,
		Logger:   logger,
	})
	linkPublicHandler := linkpublic.NewHandler(linkService, pagePublicHandler, logger)

	adminMux := http.NewServeMux()
	authenticateManager := user.Authenticate(signer, userService, logger)
	healthHandler.Register(adminMux)
	setupHandler.Register(adminMux)
	userHandler.Register(adminMux, authenticateManager)
	applicationHandler.RegisterAdmin(adminMux, authenticateManager)
	documentHandler.RegisterAdmin(adminMux, authenticateManager)
	groupHandler.Register(adminMux, authenticateManager, "/links/groups", group.KindLinks, linkService)
	linkHandler.Register(adminMux, authenticateManager)
	linkHistoryHandler.Register(adminMux, authenticateManager)
	linkAnalyticsHandler.Register(adminMux, authenticateManager)
	groupHandler.Register(adminMux, authenticateManager, "/pages/groups", group.KindPages, pageService)
	pageHandler.Register(adminMux, authenticateManager)
	versionHandler.Register(adminMux, authenticateManager)
	pageHistoryHandler.Register(adminMux, authenticateManager)
	pageAnalyticsHandler.Register(adminMux, authenticateManager)
	overviewHandler.Register(adminMux, authenticateManager)
	accessHandler.Register(adminMux, authenticateManager)
	bindingHandler.Register(adminMux, authenticateManager)

	publicMux := http.NewServeMux()
	authenticateApplication := application.Authenticate(applicationService, logger)
	healthHandler.Register(publicMux)
	applicationHandler.RegisterPublic(publicMux, authenticateApplication)
	documentHandler.RegisterPublic(publicMux, authenticateApplication)
	linkPublicHandler.Register(publicMux)

	root := http.NewServeMux()
	root.Handle(adminPrefix+"/", http.StripPrefix(adminPrefix, httpx.CORS(cfg.AdminCORSAllowedOrigins, true)(adminMux)))
	root.Handle("/", httpx.CORS(cfg.CORSAllowedOrigins, false)(publicMux))

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
