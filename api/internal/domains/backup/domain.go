package backup

import (
	backuphandler "pocketrun-api/internal/domains/backup/handlers/backup"
	"pocketrun-api/internal/services/httpx"
)

func Register(router httpx.Router, service *backuphandler.Service) {
	backuphandler.NewHandler(service, router.Validate, router.Logger).Register(router.Admin, router.Authenticate)
}
