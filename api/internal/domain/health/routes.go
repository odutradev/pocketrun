package health

import (
	"net/http"

	"pocketrun-api/internal/domain/health/handlers/ping"
)

func RegisterRoutes(routeMux *http.ServeMux) {
	routeMux.HandleFunc("GET /ping", ping.Ping)
}
