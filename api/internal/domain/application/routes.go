package application

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
	appsHandler "pocketrun-api/internal/domain/application/handlers/apps"
	explorerHandler "pocketrun-api/internal/domain/application/handlers/explorer"
	tokensHandler "pocketrun-api/internal/domain/application/handlers/tokens"
	appsRepo "pocketrun-api/internal/domain/application/repositories/apps"
	tokensRepo "pocketrun-api/internal/domain/application/repositories/tokens"
	kvDocumentsRepo "pocketrun-api/internal/domain/kv/repositories/documents"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB, managerAuthMiddleware func(http.Handler) http.Handler) {
	appsRepository := appsRepo.NewRepository(mongoDatabase)
	tokensRepository := tokensRepo.NewRepository(mongoDatabase)
	kvDocumentsRepository := kvDocumentsRepo.NewRepository(mongoDatabase)

	applicationAppsHandler := appsHandler.NewHandler(appsRepository, kvDocumentsRepository)
	applicationTokensHandler := tokensHandler.NewHandler(tokensRepository)
	applicationExplorerHandler := explorerHandler.NewHandler(appsRepository, kvDocumentsRepository)

	routeMux.Handle("GET /apps", managerAuthMiddleware(http.HandlerFunc(applicationAppsHandler.ListApps)))
	routeMux.Handle("POST /apps", managerAuthMiddleware(http.HandlerFunc(applicationAppsHandler.CreateApp)))

	routeMux.Handle("/apps/", managerAuthMiddleware(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		relativePath := strings.TrimPrefix(request.URL.Path, "/apps/")
		pathSegments := strings.Split(relativePath, "/")

		if len(pathSegments) == 1 && pathSegments[0] != "" {
			applicationID := pathSegments[0]
			switch request.Method {
			case http.MethodGet:
				applicationAppsHandler.GetApp(responseWriter, request, applicationID)
			case http.MethodPut:
				applicationAppsHandler.UpdateApp(responseWriter, request, applicationID)
			case http.MethodDelete:
				applicationAppsHandler.DeleteApp(responseWriter, request, applicationID)
			default:
				http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}

		if len(pathSegments) == 2 && pathSegments[1] == "tokens" && request.Method == http.MethodPost {
			applicationTokensHandler.CreateToken(responseWriter, request, pathSegments[0])
			return
		}

		if len(pathSegments) == 3 && pathSegments[1] == "tokens" && request.Method == http.MethodDelete {
			applicationTokensHandler.DeleteToken(responseWriter, request, pathSegments[0], pathSegments[2])
			return
		}

		if len(pathSegments) == 3 && pathSegments[1] == "explorer" && pathSegments[2] == "collections" && request.Method == http.MethodGet {
			applicationExplorerHandler.GetExplorerCollections(responseWriter, request, pathSegments[0])
			return
		}

		if len(pathSegments) == 3 && pathSegments[1] == "explorer" && request.Method == http.MethodGet {
			applicationExplorerHandler.GetExplorerDocuments(responseWriter, request, pathSegments[0], pathSegments[2])
			return
		}

		http.Error(responseWriter, "Endpoint not found", http.StatusNotFound)
	})))
}
