package user

import (
	"net/http"

	"pocketrun-api/internal/database"
	authHandler "pocketrun-api/internal/domain/user/handlers/auth"
	usersRepo "pocketrun-api/internal/domain/user/repositories/users"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB, managerAuthMiddleware func(http.Handler) http.Handler) {
	usersRepository := usersRepo.NewRepository(mongoDatabase)
	userAuthHandler := authHandler.NewHandler(usersRepository)

	routeMux.HandleFunc("POST /auth/register", userAuthHandler.Register)
	routeMux.HandleFunc("POST /auth/login", userAuthHandler.Login)
	routeMux.Handle("GET /auth/me", managerAuthMiddleware(http.HandlerFunc(userAuthHandler.Me)))
}
