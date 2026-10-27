package router

import (
	"net/http"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application"
	"pocketrun-api/internal/domain/health"
	"pocketrun-api/internal/domain/kv"
	"pocketrun-api/internal/domain/setup"
	"pocketrun-api/internal/domain/user"
	"pocketrun-api/internal/middleware/cors"
)

func NewAdminRouter(db *database.MongoDB, allowedOrigins string) http.Handler {
	mux := http.NewServeMux()

	managerAuthMW := user.ManagerAuth()

	health.RegisterRoutes(mux)
	setup.RegisterRoutes(mux, db)
	user.RegisterRoutes(mux, db, managerAuthMW)
	application.RegisterRoutes(mux, db, managerAuthMW)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}

func NewPublicRouter(db *database.MongoDB, allowedOrigins string) http.Handler {
	mux := http.NewServeMux()

	appAuthMW := application.AppAuth(db)

	health.RegisterRoutes(mux)
	kv.RegisterRoutes(mux, db, appAuthMW)

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}
