package kv

import (
	"pocketrun-api/internal/domains/kv/handlers/application"
	"pocketrun-api/internal/domains/kv/handlers/document"
	"pocketrun-api/internal/domains/kv/middlewares/appauth"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	Applications *application.Service
	Documents    *document.Service
}

func Register(router httpx.Router, services Services) {
	applicationHandler := application.NewHandler(services.Applications, router.Validate, router.Logger)
	documentHandler := document.NewHandler(services.Documents, services.Applications, router.Validate, router.Logger)
	authenticateApplication := appauth.Authenticate(services.Applications, router.Logger)

	applicationHandler.RegisterAdmin(router.Admin, router.Authenticate)
	documentHandler.RegisterAdmin(router.Admin, router.Authenticate)
	applicationHandler.RegisterPublic(router.Public, authenticateApplication)
	documentHandler.RegisterPublic(router.Public, authenticateApplication)
}
