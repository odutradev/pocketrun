package user

import (
	"net/http"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(mux *http.ServeMux, db *database.MongoDB, managerAuthMW func(http.Handler) http.Handler, jwtSecret string) {
	h := NewAuthHandler(db, jwtSecret)

	mux.HandleFunc("POST /api/v1/auth/register", h.Register)
	mux.HandleFunc("POST /api/v1/auth/login", h.Login)
	mux.Handle("GET /api/v1/auth/me", managerAuthMW(http.HandlerFunc(h.Me)))
}
