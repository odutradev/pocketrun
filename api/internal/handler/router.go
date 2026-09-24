package handler

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/health"
	"pocketrun-api/internal/middleware"
)

func NewRouter(db *database.MongoDB, allowedOrigins, jwtSecret string) http.Handler {
	mux := http.NewServeMux()

	authHandler := NewAuthHandler(db, jwtSecret)
	appHandler := NewAppHandler(db)
	kvHandler := NewKVHandler(db)

	managerAuthMW := middleware.ManagerAuth(jwtSecret)
	appAuthMW := middleware.AppAuth(db)

	// Health Check
	mux.HandleFunc("GET /ping", health.Ping)

	// Manager Auth Public Routes
	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.Handle("GET /api/v1/auth/me", managerAuthMW(http.HandlerFunc(authHandler.Me)))

	// Manager Apps Routes
	mux.Handle("GET /api/v1/apps", managerAuthMW(http.HandlerFunc(appHandler.ListApps)))
	mux.Handle("POST /api/v1/apps", managerAuthMW(http.HandlerFunc(appHandler.CreateApp)))

	// Dynamic Manager App Sub-routes
	mux.Handle("/api/v1/apps/", managerAuthMW(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/api/v1/apps/")
		parts := strings.Split(path, "/")

		if len(parts) == 1 && parts[0] != "" {
			appID := parts[0]
			switch r.Method {
			case http.MethodGet:
				appHandler.GetApp(w, r, appID)
			case http.MethodPut:
				appHandler.UpdateApp(w, r, appID)
			case http.MethodDelete:
				appHandler.DeleteApp(w, r, appID)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}

		if len(parts) == 2 && parts[1] == "tokens" && r.Method == http.MethodPost {
			appHandler.CreateToken(w, r, parts[0])
			return
		}

		if len(parts) == 3 && parts[1] == "tokens" && r.Method == http.MethodDelete {
			appHandler.DeleteToken(w, r, parts[0], parts[2])
			return
		}

		if len(parts) == 3 && parts[1] == "explorer" && parts[2] == "collections" && r.Method == http.MethodGet {
			appHandler.GetExplorerCollections(w, r, parts[0])
			return
		}

		if len(parts) == 3 && parts[1] == "explorer" && r.Method == http.MethodGet {
			appHandler.GetExplorerDocuments(w, r, parts[0], parts[2])
			return
		}

		http.Error(w, "Endpoint not found", http.StatusNotFound)
	})))

	// KV Public Client App Storage Routes (Protected by appAuthMW)
	mux.Handle("/validate/control-access", appAuthMW(http.HandlerFunc(kvHandler.ValidateControlAccess)))

	mux.Handle("/kv/", appAuthMW(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/kv/")
		parts := strings.Split(path, "/")

		if path == "project/delete-all" && r.Method == http.MethodDelete {
			kvHandler.DeleteAllProject(w, r)
			return
		}

		if len(parts) < 2 {
			http.Error(w, "Invalid KV route pattern", http.StatusBadRequest)
			return
		}

		collectionName := parts[0]
		action := parts[1]

		switch action {
		case "create":
			if r.Method == http.MethodPost {
				kvHandler.Create(w, r, collectionName)
				return
			}
		case "get-all":
			if r.Method == http.MethodGet {
				kvHandler.GetAll(w, r, collectionName)
				return
			}
		case "get":
			if len(parts) == 3 && r.Method == http.MethodGet {
				kvHandler.GetByID(w, r, collectionName, parts[2])
				return
			}
		case "update":
			if len(parts) == 3 && r.Method == http.MethodPatch {
				kvHandler.Update(w, r, collectionName, parts[2])
				return
			}
		case "delete":
			if len(parts) == 3 && r.Method == http.MethodDelete {
				kvHandler.Delete(w, r, collectionName, parts[2])
				return
			}
		case "delete-all":
			if r.Method == http.MethodDelete {
				kvHandler.DeleteAllCollection(w, r, collectionName)
				return
			}
		}

		http.Error(w, "Endpoint not found or method not allowed", http.StatusNotFound)
	})))

	// Global CORS middleware fallback
	corsMiddleware := middleware.CORS(allowedOrigins)
	return corsMiddleware(mux)
}
