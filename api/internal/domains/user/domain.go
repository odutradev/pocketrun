package user

import (
	"pocketrun-api/internal/domains/user/handlers/setup"
	userhandler "pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	Users *userhandler.Service
	Setup *setup.Service
}

func Register(router httpx.Router, services Services) {
	setup.NewHandler(services.Setup, router.Validate, router.Logger).Register(router.Admin)
	userhandler.NewHandler(services.Users, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
}
