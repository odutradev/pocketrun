package setup

import (
	"net/http"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB) {
	setupHandler := NewSetupHandler(mongoDatabase)
	routeMux.HandleFunc("GET /api/v1/setup/status", setupHandler.GetStatus)
	routeMux.HandleFunc("POST /api/v1/setup/admin", setupHandler.SetupAdmin)
}
