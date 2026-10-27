package user

import (
	"net/http"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/user/handlers"
	"pocketrun-api/internal/domain/user/repositories"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB, managerAuthMiddleware func(http.Handler) http.Handler) {
	userRepository := repositories.NewUserRepository(mongoDatabase)
	authHandler := handlers.NewAuthHandler(userRepository)

	routeMux.HandleFunc("POST /auth/register", authHandler.Register)
	routeMux.HandleFunc("POST /auth/login", authHandler.Login)
	routeMux.Handle("GET /auth/me", managerAuthMiddleware(http.HandlerFunc(authHandler.Me)))
}
