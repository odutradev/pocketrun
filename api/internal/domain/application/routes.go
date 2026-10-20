package application

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(mux *http.ServeMux, db *database.MongoDB, managerAuthMW func(http.Handler) http.Handler) {
	h := NewAppHandler(db)

	mux.Handle("GET /api/v1/apps", managerAuthMW(http.HandlerFunc(h.ListApps)))
	mux.Handle("POST /api/v1/apps", managerAuthMW(http.HandlerFunc(h.CreateApp)))

	mux.Handle("/api/v1/apps/", managerAuthMW(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/api/v1/apps/")
		parts := strings.Split(path, "/")

		if len(parts) == 1 && parts[0] != "" {
			appID := parts[0]
			switch r.Method {
			case http.MethodGet:
				h.GetApp(w, r, appID)
			case http.MethodPut:
				h.UpdateApp(w, r, appID)
			case http.MethodDelete:
				h.DeleteApp(w, r, appID)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}

		if len(parts) == 2 && parts[1] == "tokens" && r.Method == http.MethodPost {
			h.CreateToken(w, r, parts[0])
			return
		}

		if len(parts) == 3 && parts[1] == "tokens" && r.Method == http.MethodDelete {
			h.DeleteToken(w, r, parts[0], parts[2])
			return
		}

		if len(parts) == 3 && parts[1] == "explorer" && parts[2] == "collections" && r.Method == http.MethodGet {
			h.GetExplorerCollections(w, r, parts[0])
			return
		}

		if len(parts) == 3 && parts[1] == "explorer" && r.Method == http.MethodGet {
			h.GetExplorerDocuments(w, r, parts[0], parts[2])
			return
		}

		http.Error(w, "Endpoint not found", http.StatusNotFound)
	})))
}
