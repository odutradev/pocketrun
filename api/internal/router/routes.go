package router

import (
	"net/http"

	"pocketrun-api/internal/config"
	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application"
	"pocketrun-api/internal/domain/health"
	"pocketrun-api/internal/domain/kv"
	"pocketrun-api/internal/domain/setup"
	"pocketrun-api/internal/domain/user"
	"pocketrun-api/internal/middleware/cors"
)

func NewAdminRouter(mongoDatabase *database.MongoDB) http.Handler {
	defaultOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "*")
	allowedOrigins := config.GetEnv("ADMIN_CORS_ALLOWED_ORIGINS", defaultOrigins)

	routeMux := http.NewServeMux()

	managerAuthMiddleware := user.ManagerAuth()

	health.RegisterRoutes(routeMux)
	setup.RegisterRoutes(routeMux, mongoDatabase)
	user.RegisterRoutes(routeMux, mongoDatabase, managerAuthMiddleware)
	application.RegisterRoutes(routeMux, mongoDatabase, managerAuthMiddleware)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(routeMux)
}

func NewPublicRouter(mongoDatabase *database.MongoDB) http.Handler {
	allowedOrigins := config.GetEnv("CORS_ALLOWED_ORIGINS", "*")

	routeMux := http.NewServeMux()

	applicationAuthMiddleware := application.AppAuth(mongoDatabase)

	health.RegisterRoutes(routeMux)
	kv.RegisterRoutes(routeMux, mongoDatabase, applicationAuthMiddleware)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(routeMux)
}
