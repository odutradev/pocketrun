package mcp

import (
	"pocketrun-api/internal/domains/mcp/handlers/rpc"
	"pocketrun-api/internal/domains/mcp/middlewares/apikeyauth"
	"pocketrun-api/internal/domains/user/handlers/apikey"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	APIKeys *apikey.Service
}

func Register(router httpx.Router, services Services) {
	service := rpc.NewService(rpc.Dependencies{Admin: router.Admin, Logger: router.Logger})
	authenticate := apikeyauth.Authenticate(services.APIKeys, apikey.ErrInvalidKey, router.Logger)
	handler := rpc.NewHandler(service, router.Logger)
	handler.Register(router.Public, authenticate)
	if router.HasLinksDomain() {
		handler.Register(router.Links, authenticate)
	}
}
