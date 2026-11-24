package health

import (
	"pocketrun-api/internal/domains/health/handlers/health"
	"pocketrun-api/internal/services/httpx"
)

func Register(router httpx.Router) {
	handler := health.NewHandler(health.NewService())
	handler.Register(router.Admin)
	handler.Register(router.Public)
	if router.HasLinksDomain() {
		handler.Register(router.Links)
	}
}
