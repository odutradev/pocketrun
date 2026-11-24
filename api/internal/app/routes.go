package app

import (
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/domains/backup"
	"pocketrun-api/internal/domains/group"
	"pocketrun-api/internal/domains/health"
	"pocketrun-api/internal/domains/kv/application"
	kvdocument "pocketrun-api/internal/domains/kv/document"
	linkanalytics "pocketrun-api/internal/domains/link/analytics"
	linkhistory "pocketrun-api/internal/domains/link/history"
	"pocketrun-api/internal/domains/link/link"
	linkpublic "pocketrun-api/internal/domains/link/public"
	"pocketrun-api/internal/domains/overview"
	"pocketrun-api/internal/domains/page/access"
	pageanalytics "pocketrun-api/internal/domains/page/analytics"
	"pocketrun-api/internal/domains/page/binding"
	pagehistory "pocketrun-api/internal/domains/page/history"
	"pocketrun-api/internal/domains/page/page"
	pagepublic "pocketrun-api/internal/domains/page/public"
	"pocketrun-api/internal/domains/page/version"
	"pocketrun-api/internal/domains/user/setup"
	"pocketrun-api/internal/domains/user/user"
	"pocketrun-api/internal/services/httpx"
)

const adminPrefix = "/admin"

func newRouter(cfg config.Config, s services, validate *validator.Validate, logger *slog.Logger) http.Handler {
	healthHandler := health.NewHandler()
	documentHandler := kvdocument.NewHandler(s.documents, s.applications, s.usage, validate, logger)
	applicationHandler := application.NewHandler(s.applications, validate, logger)
	groupHandler := group.NewHandler(s.groups, validate, logger)
	pagePublicHandler := pagepublic.NewHandler(pagepublic.Dependencies{
		Pages:    s.pages,
		Guard:    s.access,
		Data:     s.bindings,
		PagesURL: cfg.LinksURL,
		Validate: validate,
		Logger:   logger,
	})

	adminMux := http.NewServeMux()
	authenticateManager := user.Authenticate(s.signer, s.users, logger)
	healthHandler.Register(adminMux)
	setup.NewHandler(s.setup, validate, logger).Register(adminMux)
	user.NewHandler(s.users, validate, logger).Register(adminMux, authenticateManager)
	applicationHandler.RegisterAdmin(adminMux, authenticateManager)
	documentHandler.RegisterAdmin(adminMux, authenticateManager)
	groupHandler.Register(adminMux, authenticateManager, "/links/groups", group.KindLinks, s.links)
	link.NewHandler(s.links, cfg.LinksURL, validate, logger).Register(adminMux, authenticateManager)
	linkhistory.NewHandler(s.linkHistory, s.links, validate, logger).Register(adminMux, authenticateManager)
	linkanalytics.NewHandler(s.linkAnalytics, s.links, validate, logger).Register(adminMux, authenticateManager)
	groupHandler.Register(adminMux, authenticateManager, "/pages/groups", group.KindPages, s.pages)
	page.NewHandler(s.pages, validate, logger).Register(adminMux, authenticateManager)
	version.NewHandler(s.versions, s.pages, logger).Register(adminMux, authenticateManager)
	pagehistory.NewHandler(s.pageHistory, s.pages, validate, logger).Register(adminMux, authenticateManager)
	pageanalytics.NewHandler(s.pageAnalytics, s.pages, validate, logger).Register(adminMux, authenticateManager)
	overview.NewHandler(s.overview, validate, logger).Register(adminMux, authenticateManager)
	access.NewHandler(s.access, s.pages, validate, logger).Register(adminMux, authenticateManager)
	binding.NewHandler(s.bindings, s.pages, validate, logger).Register(adminMux, authenticateManager)
	backup.NewHandler(s.backup, validate, logger).Register(adminMux, authenticateManager)

	publicMux := http.NewServeMux()
	authenticateApplication := application.Authenticate(s.applications, logger)
	healthHandler.Register(publicMux)
	applicationHandler.RegisterPublic(publicMux, authenticateApplication)
	documentHandler.RegisterPublic(publicMux, authenticateApplication)
	linkpublic.NewHandler(s.links, pagePublicHandler, logger).Register(publicMux)

	root := http.NewServeMux()
	root.Handle(adminPrefix+"/", http.StripPrefix(adminPrefix, httpx.CORS(cfg.AdminCORSAllowedOrigins, true)(adminMux)))
	root.Handle("/", httpx.CORS(cfg.CORSAllowedOrigins, false)(publicMux))
	return root
}
