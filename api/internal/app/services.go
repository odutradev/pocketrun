package app

import (
	"log/slog"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/domains/backup/handlers/backup"
	"pocketrun-api/internal/domains/group/handlers/group"
	"pocketrun-api/internal/domains/kv/handlers/application"
	kvdocument "pocketrun-api/internal/domains/kv/handlers/document"
	linkanalytics "pocketrun-api/internal/domains/link/handlers/analytics"
	linkhistory "pocketrun-api/internal/domains/link/handlers/history"
	"pocketrun-api/internal/domains/link/handlers/link"
	"pocketrun-api/internal/domains/overview/handlers/overview"
	"pocketrun-api/internal/domains/page/handlers/access"
	pageanalytics "pocketrun-api/internal/domains/page/handlers/analytics"
	"pocketrun-api/internal/domains/page/handlers/binding"
	pagehistory "pocketrun-api/internal/domains/page/handlers/history"
	"pocketrun-api/internal/domains/page/handlers/page"
	"pocketrun-api/internal/domains/page/handlers/version"
	"pocketrun-api/internal/domains/user/handlers/setup"
	"pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/domains/user/utils/jwt"
	"pocketrun-api/internal/domains/user/utils/sessioncookie"
	historyservice "pocketrun-api/internal/services/history"
	"pocketrun-api/internal/services/slug"
	"pocketrun-api/internal/services/traffic"
)

type services struct {
	signer        *jwt.Signer
	session       sessioncookie.Cookie
	users         *user.Service
	setup         *setup.Service
	applications  *application.Service
	documents     *kvdocument.Service
	groups        *group.Service
	links         *link.Service
	linkHistory   *historyservice.Service
	linkAnalytics *linkanalytics.Service
	pages         *page.Service
	versions      *version.Service
	pageHistory   *historyservice.Service
	pageAnalytics *pageanalytics.Service
	access        *access.Service
	bindings      *binding.Service
	overview      *overview.Service
	backup        *backup.Service
}

func newServices(cfg config.Config, repos repositories, logger *slog.Logger) services {
	uniques := traffic.NewUniqueRegistry(repos.uniqueVisitors, cfg.JWTSecret)
	signer := jwt.NewSigner(cfg.JWTSecret)
	documents := kvdocument.NewService(repos.documents, repos.usage, logger)
	applications := application.NewService(repos.applications, documents)
	users := user.NewService(user.Dependencies{
		Repository:   repos.users,
		Attempts:     repos.loginAttempts,
		Signer:       signer,
		Applications: applications,
		Logger:       logger,
	})
	slugs := slug.NewService(repos.slugs)
	groups := group.NewService(repos.groups)

	linkHistory := linkhistory.NewService(repos.linkEvents, logger)
	linkAnalytics := linkanalytics.NewService(repos.linkOpens, logger)
	links := link.NewService(link.Dependencies{
		Repository: repos.links,
		History:    linkHistory,
		Opens:      linkAnalytics,
		Uniques:    uniques,
		Slugs:      slugs,
		Groups:     groups,
		Actors:     users,
		Logger:     logger,
	})

	versions := version.NewService(repos.pageVersions, logger)
	pageHistory := pagehistory.NewService(repos.pageEvents, logger)
	pageAnalytics := pageanalytics.NewService(repos.pageOpens, logger)
	pageAccess := access.NewService(access.Dependencies{
		Repository: repos.pageAccess,
		Attempts:   repos.pageAccessAttempt,
		History:    pageHistory,
		Actors:     users,
		Secret:     cfg.PageAccessSecret,
		Logger:     logger,
	})
	bindings := binding.NewService(binding.Dependencies{
		Repository:   repos.pageBindings,
		Requests:     repos.pageKVRequests,
		Applications: applications,
		Access:       pageAccess,
		Documents:    documents,
		History:      pageHistory,
		Actors:       users,
		Logger:       logger,
	})
	pages := page.NewService(page.Dependencies{
		Repository: repos.pages,
		Versions:   versions,
		History:    pageHistory,
		Opens:      pageAnalytics,
		Uniques:    uniques,
		Access:     pageAccess,
		Bindings:   bindings,
		Slugs:      slugs,
		Groups:     groups,
		Actors:     users,
		Logger:     logger,
	})

	migrations := []backup.Indexer{repos.linkEvents, repos.linkOpens, repos.pageEvents, repos.pageOpens}
	return services{
		signer:        signer,
		session:       sessioncookie.New(cfg.AllowsHTTP()),
		users:         users,
		setup:         setup.NewService(users, logger),
		applications:  applications,
		documents:     documents,
		groups:        groups,
		links:         links,
		linkHistory:   linkHistory,
		linkAnalytics: linkAnalytics,
		pages:         pages,
		versions:      versions,
		pageHistory:   pageHistory,
		pageAnalytics: pageAnalytics,
		access:        pageAccess,
		bindings:      bindings,
		overview:      overview.NewService(overview.Dependencies{Pages: pageAnalytics, Links: linkAnalytics, KV: documents, PageKV: bindings}),
		backup:        backup.NewService(repos.backup, users, migrations, logger),
	}
}
