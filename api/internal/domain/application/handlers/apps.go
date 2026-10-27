package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"pocketrun-api/internal/domain/application/repositories"
	"pocketrun-api/internal/domain/user"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func (handler *AppHandler) ListApps(responseWriter http.ResponseWriter, request *http.Request) {
	managerIDString := user.GetManagerID(request.Context())
	managerObjectID, parseError := bson.ObjectIDFromHex(managerIDString)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	applications, findError := handler.AppRepository.FindByManagerID(queryContext, managerObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch applications"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, applications)
}

func (handler *AppHandler) CreateApp(responseWriter http.ResponseWriter, request *http.Request) {
	managerIDString := user.GetManagerID(request.Context())
	managerObjectID, parseError := bson.ObjectIDFromHex(managerIDString)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var createPayload CreateAppRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&createPayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	createPayload.Name = strings.TrimSpace(createPayload.Name)
	createPayload.ProjectID = strings.ToLower(strings.TrimSpace(createPayload.ProjectID))
	if createPayload.Name == "" || createPayload.ProjectID == "" {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Name and project_id are required"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	if handler.AppRepository.ExistsByProjectID(queryContext, createPayload.ProjectID) {
		writeJSONResponse(responseWriter, http.StatusConflict, map[string]string{"error": "project_id is already in use"})
		return
	}

	if createPayload.AllowedOrigins == nil {
		createPayload.AllowedOrigins = []string{"*"}
	}

	rawToken, generatedToken, tokenError := repositories.GenerateAPIToken("Default Token", 365)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate initial token"})
		return
	}

	currentTime := time.Now()
	newApplication := repositories.Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerObjectID,
		Name:                    createPayload.Name,
		ProjectID:               createPayload.ProjectID,
		Description:             createPayload.Description,
		AllowedOrigins:          createPayload.AllowedOrigins,
		AllowNonBrowserRequests: true,
		Tokens:                  []repositories.Token{generatedToken},
		CreatedAt:               currentTime,
		UpdatedAt:               currentTime,
	}

	if insertError := handler.AppRepository.Create(queryContext, newApplication); insertError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to create application"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusCreated, CreateAppResponse{
		Application: newApplication,
		RawToken:    rawToken,
	})
}

func (handler *AppHandler) GetApp(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	foundApplication, findError := handler.AppRepository.FindByIDAndManager(queryContext, applicationObjectID, managerObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, foundApplication)
}

func (handler *AppHandler) UpdateApp(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	var updatePayload CreateAppRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&updatePayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	matched, updateError := handler.AppRepository.UpdateByIDAndManager(
		queryContext,
		applicationObjectID,
		managerObjectID,
		updatePayload.Name,
		updatePayload.Description,
		updatePayload.AllowedOrigins,
		updatePayload.AllowNonBrowserRequests,
	)
	if updateError != nil || !matched {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found or update failed"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Application updated successfully"})
}

func (handler *AppHandler) DeleteApp(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancelQuery()

	deleted, deleteError := handler.AppRepository.DeleteByIDAndManager(queryContext, applicationObjectID, managerObjectID)
	if deleteError != nil || !deleted {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	_, _ = handler.KVRepository.DeleteByAppID(queryContext, applicationObjectID)

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Application and all associated data deleted successfully"})
}
