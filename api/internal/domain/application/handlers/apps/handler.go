package apps

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	appsRepo "pocketrun-api/internal/domain/application/repositories/apps"
	tokensRepo "pocketrun-api/internal/domain/application/repositories/tokens"
	kvDocumentsRepo "pocketrun-api/internal/domain/kv/repositories/documents"
	userUtils "pocketrun-api/internal/domain/user/utils"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Handler struct {
	AppsRepository        *appsRepo.Repository
	KVDocumentsRepository *kvDocumentsRepo.Repository
}

func NewHandler(
	appsRepository *appsRepo.Repository,
	kvDocumentsRepository *kvDocumentsRepo.Repository,
) *Handler {
	return &Handler{
		AppsRepository:        appsRepository,
		KVDocumentsRepository: kvDocumentsRepository,
	}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func parseManagerAndApplicationIDs(request *http.Request, applicationIDHex string) (bson.ObjectID, bson.ObjectID, error) {
	managerIDString := userUtils.GetManagerID(request.Context())
	managerObjectID, _ := bson.ObjectIDFromHex(managerIDString)
	applicationObjectID, parseError := bson.ObjectIDFromHex(applicationIDHex)
	return managerObjectID, applicationObjectID, parseError
}

func (handler *Handler) ListApps(responseWriter http.ResponseWriter, request *http.Request) {
	managerIDString := userUtils.GetManagerID(request.Context())
	managerObjectID, parseError := bson.ObjectIDFromHex(managerIDString)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	applications, findError := handler.AppsRepository.FindByManagerID(queryContext, managerObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch applications"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, applications)
}

func (handler *Handler) CreateApp(responseWriter http.ResponseWriter, request *http.Request) {
	managerIDString := userUtils.GetManagerID(request.Context())
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

	if handler.AppsRepository.ExistsByProjectID(queryContext, createPayload.ProjectID) {
		writeJSONResponse(responseWriter, http.StatusConflict, map[string]string{"error": "project_id is already in use"})
		return
	}

	if createPayload.AllowedOrigins == nil {
		createPayload.AllowedOrigins = []string{"*"}
	}

	rawToken, generatedToken, tokenError := tokensRepo.GenerateAPIToken("Default Token", 365)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate initial token"})
		return
	}

	currentTime := time.Now()
	newApplication := appsRepo.Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerObjectID,
		Name:                    createPayload.Name,
		ProjectID:               createPayload.ProjectID,
		Description:             createPayload.Description,
		AllowedOrigins:          createPayload.AllowedOrigins,
		AllowNonBrowserRequests: true,
		Tokens:                  []tokensRepo.Token{generatedToken},
		CreatedAt:               currentTime,
		UpdatedAt:               currentTime,
	}

	if insertError := handler.AppsRepository.Create(queryContext, newApplication); insertError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to create application"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusCreated, CreateAppResponse{
		Application: newApplication,
		RawToken:    rawToken,
	})
}

func (handler *Handler) GetApp(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	foundApplication, findError := handler.AppsRepository.FindByIDAndManager(queryContext, applicationObjectID, managerObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, foundApplication)
}

func (handler *Handler) UpdateApp(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
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

	matched, updateError := handler.AppsRepository.UpdateByIDAndManager(
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

func (handler *Handler) DeleteApp(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancelQuery()

	deleted, deleteError := handler.AppsRepository.DeleteByIDAndManager(queryContext, applicationObjectID, managerObjectID)
	if deleteError != nil || !deleted {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	_, _ = handler.KVDocumentsRepository.DeleteByAppID(queryContext, applicationObjectID)

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Application and all associated data deleted successfully"})
}

