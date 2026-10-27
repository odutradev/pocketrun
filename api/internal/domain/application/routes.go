package application

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB, managerAuthMiddleware func(http.Handler) http.Handler) {
	applicationHandler := NewAppHandler(mongoDatabase)

	routeMux.Handle("GET /api/v1/apps", managerAuthMiddleware(http.HandlerFunc(applicationHandler.ListApps)))
	routeMux.Handle("POST /api/v1/apps", managerAuthMiddleware(http.HandlerFunc(applicationHandler.CreateApp)))

	routeMux.Handle("/api/v1/apps/", managerAuthMiddleware(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		relativePath := strings.TrimPrefix(request.URL.Path, "/api/v1/apps/")
		pathSegments := strings.Split(relativePath, "/")

		if len(pathSegments) == 1 && pathSegments[0] != "" {
			applicationID := pathSegments[0]
			switch request.Method {
			case http.MethodGet:
				applicationHandler.GetApp(responseWriter, request, applicationID)
			case http.MethodPut:
				applicationHandler.UpdateApp(responseWriter, request, applicationID)
			case http.MethodDelete:
				applicationHandler.DeleteApp(responseWriter, request, applicationID)
			default:
				http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}

		if len(pathSegments) == 2 && pathSegments[1] == "tokens" && request.Method == http.MethodPost {
			applicationHandler.CreateToken(responseWriter, request, pathSegments[0])
			return
		}

		if len(pathSegments) == 3 && pathSegments[1] == "tokens" && request.Method == http.MethodDelete {
			applicationHandler.DeleteToken(responseWriter, request, pathSegments[0], pathSegments[2])
			return
		}

		if len(pathSegments) == 3 && pathSegments[1] == "explorer" && pathSegments[2] == "collections" && request.Method == http.MethodGet {
			applicationHandler.GetExplorerCollections(responseWriter, request, pathSegments[0])
			return
		}

		if len(pathSegments) == 3 && pathSegments[1] == "explorer" && request.Method == http.MethodGet {
			applicationHandler.GetExplorerDocuments(responseWriter, request, pathSegments[0], pathSegments[2])
			return
		}

		http.Error(responseWriter, "Endpoint not found", http.StatusNotFound)
	})))
}
