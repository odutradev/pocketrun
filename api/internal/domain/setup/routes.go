package setup

import (
	"net/http"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/setup/handlers"
	userRepositories "pocketrun-api/internal/domain/user/repositories"
)

func CheckInitialStatus(mongoDatabase *database.MongoDB) {
	userRepository := userRepositories.NewUserRepository(mongoDatabase)
	handlers.CheckInitialStatus(userRepository)
}

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB) {
	userRepository := userRepositories.NewUserRepository(mongoDatabase)
	setupHandler := handlers.NewSetupHandler(userRepository)

	routeMux.HandleFunc("GET /setup/status", setupHandler.GetStatus)
	routeMux.HandleFunc("POST /setup/admin", setupHandler.SetupAdmin)
}
