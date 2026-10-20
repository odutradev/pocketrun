package handler

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/handler/app"
	"pocketrun-api/internal/handler/auth"
	"pocketrun-api/internal/handler/health"
	"pocketrun-api/internal/handler/kv"
	"pocketrun-api/internal/handler/setup"
	authMW "pocketrun-api/internal/middleware/auth"
	"pocketrun-api/internal/middleware/cors"
)

func NewAdminRouter(db *database.MongoDB, allowedOrigins, jwtSecret string) http.Handler {
	mux := http.NewServeMux()

	setupHandler := setup.NewSetupHandler(db, jwtSecret)
	authHandler := auth.NewAuthHandler(db, jwtSecret)
	appHandler := app.NewAppHandler(db)

	managerAuthMW := authMW.ManagerAuth(jwtSecret)

	mux.HandleFunc("GET /ping", health.Ping)

	mux.HandleFunc("GET /api/v1/setup/status", setupHandler.GetStatus)
	mux.HandleFunc("POST /api/v1/setup/admin", setupHandler.SetupAdmin)

	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.Handle("GET /api/v1/auth/me", managerAuthMW(http.HandlerFunc(authHandler.Me)))

	mux.Handle("GET /api/v1/apps", managerAuthMW(http.HandlerFunc(appHandler.ListApps)))
	mux.Handle("POST /api/v1/apps", managerAuthMW(http.HandlerFunc(appHandler.CreateApp)))

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

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}

func NewPublicRouter(db *database.MongoDB, allowedOrigins string) http.Handler {
	mux := http.NewServeMux()

	kvHandler := kv.NewKVHandler(db)
	appAuthMW := authMW.AppAuth(db)

	mux.HandleFunc("GET /ping", health.Ping)

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

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}

func NewRouter(db *database.MongoDB, allowedOrigins, jwtSecret string) http.Handler {
	mux := http.NewServeMux()

	setupHandler := setup.NewSetupHandler(db, jwtSecret)
	authHandler := auth.NewAuthHandler(db, jwtSecret)
	appHandler := app.NewAppHandler(db)
	kvHandler := kv.NewKVHandler(db)

	managerAuthMW := authMW.ManagerAuth(jwtSecret)
	appAuthMW := authMW.AppAuth(db)

	mux.HandleFunc("GET /ping", health.Ping)

	mux.HandleFunc("GET /api/v1/setup/status", setupHandler.GetStatus)
	mux.HandleFunc("POST /api/v1/setup/admin", setupHandler.SetupAdmin)

	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.Handle("GET /api/v1/auth/me", managerAuthMW(http.HandlerFunc(authHandler.Me)))

	mux.Handle("GET /api/v1/apps", managerAuthMW(http.HandlerFunc(appHandler.ListApps)))
	mux.Handle("POST /api/v1/apps", managerAuthMW(http.HandlerFunc(appHandler.CreateApp)))

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

	corsMiddleware := cors.CORS(allowedOrigins)
	return corsMiddleware(mux)
}
