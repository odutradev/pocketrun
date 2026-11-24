package app

import (
	"log/slog"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/domains/backup"
	"pocketrun-api/internal/domains/group"
	"pocketrun-api/internal/domains/kv/application"
	kvdocument "pocketrun-api/internal/domains/kv/document"
	kvusage "pocketrun-api/internal/domains/kv/usage"
	linkanalytics "pocketrun-api/internal/domains/link/analytics"
	linkhistory "pocketrun-api/internal/domains/link/history"
	"pocketrun-api/internal/domains/link/link"
	"pocketrun-api/internal/domains/overview"
	"pocketrun-api/internal/domains/page/access"
	pageanalytics "pocketrun-api/internal/domains/page/analytics"
	"pocketrun-api/internal/domains/page/binding"
	pagehistory "pocketrun-api/internal/domains/page/history"
	"pocketrun-api/internal/domains/page/page"
	"pocketrun-api/internal/domains/page/version"
	"pocketrun-api/internal/domains/user/setup"
	"pocketrun-api/internal/domains/user/user"
	"pocketrun-api/internal/services/slug"
	"pocketrun-api/internal/services/traffic"
)

type services struct {
	signer        *user.TokenSigner
	users         *user.Service
	setup         *setup.Service
	applications  *application.Service
	documents     *kvdocument.Service
	usage         *kvusage.Service
	groups        *group.Service
	links         *link.Service
	linkHistory   *linkhistory.Service
	linkAnalytics *linkanalytics.Service
	pages         *page.Service
	versions      *version.Service
	pageHistory   *pagehistory.Service
	pageAnalytics *pageanalytics.Service
	access        *access.Service
	bindings      *binding.Service
	overview      *overview.Service
	backup        *backup.Service
}

func newServices(cfg config.Config, repos repositories, accessKey string, logger *slog.Logger) services {
	uniques := traffic.NewUniqueRegistry(repos.uniqueVisitors, cfg.JWTSecret)
	signer := user.NewTokenSigner(cfg.JWTSecret)
	documents := kvdocument.NewService(repos.documents)
	usage := kvusage.NewService(repos.usage, logger)
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
		Secret:     accessKey,
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
		users:         users,
		setup:         setup.NewService(users, logger),
		applications:  applications,
		documents:     documents,
		usage:         usage,
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
		overview:      overview.NewService(overview.Dependencies{Pages: pageAnalytics, Links: linkAnalytics, KV: usage, PageKV: bindings}),
		backup:        backup.NewService(repos.backup, users, migrations, logger),
	}
}
