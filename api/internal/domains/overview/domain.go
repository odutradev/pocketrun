package overview

import (
	overviewhandler "pocketrun-api/internal/domains/overview/handlers/overview"
	"pocketrun-api/internal/services/httpx"
)

func Register(router httpx.Router, service *overviewhandler.Service) {
	overviewhandler.NewHandler(service, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
}
