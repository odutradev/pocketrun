package user

import (
	"pocketrun-api/internal/domains/user/handlers/apikey"
	"pocketrun-api/internal/domains/user/handlers/setup"
	userhandler "pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/domains/user/utils/sessioncookie"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	Users   *userhandler.Service
	Setup   *setup.Service
	Session sessioncookie.Cookie
	APIKeys *apikey.Service
}

func Register(router httpx.Router, services Services) {
	setup.NewHandler(services.Setup, services.Session, router.Validate, router.Logger).Register(router.Admin)
	userhandler.NewHandler(services.Users, services.Session, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
	apikey.NewHandler(services.APIKeys, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
}
