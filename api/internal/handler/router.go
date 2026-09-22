package handler

import (
	"net/http"

	"pocketrun-api/internal/domain/health"
	"pocketrun-api/internal/middleware"
)

func NewRouter(allowedOrigins string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /ping", health.Ping)

	corsMiddleware := middleware.CORS(allowedOrigins)
	return corsMiddleware(mux)
}
