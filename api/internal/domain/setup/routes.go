package setup

import (
	"net/http"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB) {
	setupHandler := NewSetupHandler(mongoDatabase)
	routeMux.HandleFunc("GET /setup/status", setupHandler.GetStatus)
	routeMux.HandleFunc("POST /setup/admin", setupHandler.SetupAdmin)
}
