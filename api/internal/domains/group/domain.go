package group

import (
	grouphandler "pocketrun-api/internal/domains/group/handlers/group"
	grouprepository "pocketrun-api/internal/repositories/group"
	"pocketrun-api/internal/services/httpx"
)

type Services struct {
	Groups *grouphandler.Service
	Links  grouphandler.Detacher
	Pages  grouphandler.Detacher
}

func Register(router httpx.Router, services Services) {
	handler := grouphandler.NewHandler(services.Groups, router.Validate, router.Logger)
	handler.Register(router.Admin, router.Authenticate, "/links/groups", grouprepository.KindLinks, services.Links)
	handler.Register(router.Admin, router.Authenticate, "/pages/groups", grouprepository.KindPages, services.Pages)
}
