package setup

import (
	"net/http"

	"pocketrun-api/internal/database"
	adminHandler "pocketrun-api/internal/domain/setup/handlers/admin"
	statusHandler "pocketrun-api/internal/domain/setup/handlers/status"
	usersRepo "pocketrun-api/internal/domain/user/repositories/users"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB) {
	usersRepository := usersRepo.NewRepository(mongoDatabase)
	setupStatusHandler := statusHandler.NewHandler(usersRepository)
	setupAdminHandler := adminHandler.NewHandler(usersRepository)

	routeMux.HandleFunc("GET /setup/status", setupStatusHandler.GetStatus)
	routeMux.HandleFunc("POST /setup/admin", setupAdminHandler.SetupAdmin)
}
