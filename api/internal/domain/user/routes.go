package user

import (
	"net/http"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB, managerAuthMiddleware func(http.Handler) http.Handler) {
	authHandler := NewAuthHandler(mongoDatabase)

	routeMux.HandleFunc("POST /auth/register", authHandler.Register)
	routeMux.HandleFunc("POST /auth/login", authHandler.Login)
	routeMux.Handle("GET /auth/me", managerAuthMiddleware(http.HandlerFunc(authHandler.Me)))
}
