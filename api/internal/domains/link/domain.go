package link

import (
	"pocketrun-api/internal/domains/link/handlers/analytics"
	"pocketrun-api/internal/domains/link/handlers/history"
	linkhandler "pocketrun-api/internal/domains/link/handlers/link"
	"pocketrun-api/internal/domains/link/handlers/public"
	historyservice "pocketrun-api/internal/services/history"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	Links     *linkhandler.Service
	History   *historyservice.Service
	Analytics *analytics.Service
}

func Register(router httpx.Router, services Services, linksURL string, pages public.PageServer) {
	linkhandler.NewHandler(services.Links, linksURL, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	history.NewHandler(services.History, services.Links, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	analytics.NewHandler(services.Analytics, services.Links, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	publicHandler := public.NewHandler(public.NewService(services.Links), pages, router.Logger)
	publicHandler.Register(router.Links)
	if router.HasLinksDomain() {
		publicHandler.RegisterOutsideLinksDomain(router.Public)
	}
}
