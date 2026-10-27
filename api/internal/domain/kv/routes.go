package kv

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/kv/handlers"
	"pocketrun-api/internal/domain/kv/repositories"
)

func RegisterRoutes(routeMux *http.ServeMux, mongoDatabase *database.MongoDB, applicationAuthMiddleware func(http.Handler) http.Handler) {
	keyValueRepository := repositories.NewKVRepository(mongoDatabase)
	keyValueHandler := handlers.NewKVHandler(keyValueRepository)

	routeMux.Handle("/validate/control-access", applicationAuthMiddleware(http.HandlerFunc(keyValueHandler.ValidateControlAccess)))

	routeMux.Handle("/kv/", applicationAuthMiddleware(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		relativePath := strings.TrimPrefix(request.URL.Path, "/kv/")
		pathSegments := strings.Split(relativePath, "/")

		if relativePath == "project/delete-all" && request.Method == http.MethodDelete {
			keyValueHandler.DeleteAllProject(responseWriter, request)
			return
		}

		if len(pathSegments) < 2 {
			http.Error(responseWriter, "Invalid KV route pattern", http.StatusBadRequest)
			return
		}

		collectionName := pathSegments[0]
		actionName := pathSegments[1]

		switch actionName {
		case "create":
			if request.Method == http.MethodPost {
				keyValueHandler.Create(responseWriter, request, collectionName)
				return
			}
		case "get-all":
			if request.Method == http.MethodGet {
				keyValueHandler.GetAll(responseWriter, request, collectionName)
				return
			}
		case "get":
			if len(pathSegments) == 3 && request.Method == http.MethodGet {
				keyValueHandler.GetByID(responseWriter, request, collectionName, pathSegments[2])
				return
			}
		case "update":
			if len(pathSegments) == 3 && request.Method == http.MethodPatch {
				keyValueHandler.Update(responseWriter, request, collectionName, pathSegments[2])
				return
			}
		case "delete":
			if len(pathSegments) == 3 && request.Method == http.MethodDelete {
				keyValueHandler.Delete(responseWriter, request, collectionName, pathSegments[2])
				return
			}
		case "delete-all":
			if request.Method == http.MethodDelete {
				keyValueHandler.DeleteAllCollection(responseWriter, request, collectionName)
				return
			}
		}

		http.Error(responseWriter, "Endpoint not found or method not allowed", http.StatusNotFound)
	})))
}
