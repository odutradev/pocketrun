package validation

import (
	"encoding/json"
	"net/http"

	"pocketrun-api/internal/domain/application"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func (handler *Handler) ValidateControlAccess(responseWriter http.ResponseWriter, request *http.Request) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, ValidateControlAccessResponse{
		Status:    "valid",
		Message:   "Access token and origin are valid",
		ProjectID: authenticatedApplication.ProjectID,
		AppName:   authenticatedApplication.Name,
	})
}
