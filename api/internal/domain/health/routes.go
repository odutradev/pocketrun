package health

import (
	"net/http"

	"pocketrun-api/internal/domain/health/handlers"
)

func RegisterRoutes(routeMux *http.ServeMux) {
	routeMux.HandleFunc("GET /ping", handlers.Ping)
}
