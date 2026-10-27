package health

import (
	"net/http"
)

func RegisterRoutes(routeMux *http.ServeMux) {
	routeMux.HandleFunc("GET /ping", Ping)
}
