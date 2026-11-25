package page

import (
	"pocketrun-api/internal/domains/page/handlers/access"
	"pocketrun-api/internal/domains/page/handlers/analytics"
	"pocketrun-api/internal/domains/page/handlers/binding"
	"pocketrun-api/internal/domains/page/handlers/config"
	"pocketrun-api/internal/domains/page/handlers/history"
	pagehandler "pocketrun-api/internal/domains/page/handlers/page"
	"pocketrun-api/internal/domains/page/handlers/public"
	"pocketrun-api/internal/domains/page/handlers/version"
	historyservice "pocketrun-api/internal/services/history"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	Pages     *pagehandler.Service
	Versions  *version.Service
	History   *historyservice.Service
	Analytics *analytics.Service
	Access    *access.Service
	Bindings  *binding.Service
	Config    *config.Service
}

func Register(router httpx.Router, services Services, pagesURL string) *public.Handler {
	pagehandler.NewHandler(services.Pages, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	version.NewHandler(services.Versions, services.Pages, router.Logger).Register(router.Admin, router.Authenticate)
	history.NewHandler(services.History, services.Pages, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	analytics.NewHandler(services.Analytics, services.Pages, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	access.NewHandler(services.Access, services.Pages, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	binding.NewHandler(services.Bindings, services.Pages, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	config.NewHandler(services.Config, services.Pages, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	return public.NewHandler(public.Dependencies{
		Pages:    services.Pages,
		Guard:    services.Access,
		Data:     services.Bindings,
		PagesURL: pagesURL,
		Validate: router.Validate,
		Logger:   router.Logger,
	})
}
