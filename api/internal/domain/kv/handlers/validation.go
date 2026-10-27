package handlers

import (
	"net/http"

	"pocketrun-api/internal/domain/application"
)

func (handler *KVHandler) ValidateControlAccess(responseWriter http.ResponseWriter, request *http.Request) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"status":     "valid",
		"message":    "Access token and origin are valid",
		"project_id": authenticatedApplication.ProjectID,
		"app_name":   authenticatedApplication.Name,
	})
}
