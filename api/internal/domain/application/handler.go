package application

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/user"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type AppHandler struct {
	Database *database.MongoDB
}

func NewAppHandler(mongoDatabase *database.MongoDB) *AppHandler {
	return &AppHandler{Database: mongoDatabase}
}

type CreateAppRequest struct {
	Name                    string   `json:"name"`
	ProjectID               string   `json:"project_id"`
	Description             string   `json:"description"`
	AllowedOrigins          []string `json:"allowed_origins"`
	AllowNonBrowserRequests bool     `json:"allow_non_browser_requests"`
}

type CreateAppResponse struct {
	Application Application `json:"application"`
	RawToken    string      `json:"raw_token"`
}

type CreateTokenRequest struct {
	Name         string `json:"name"`
	ValidityDays int    `json:"validity_days"`
}

type CreateTokenResponse struct {
	Token    Token  `json:"token"`
	RawToken string `json:"raw_token"`
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func parseManagerAndApplicationIDs(request *http.Request, applicationIDHex string) (bson.ObjectID, bson.ObjectID, error) {
	managerIDString := user.GetManagerID(request.Context())
	managerObjectID, _ := bson.ObjectIDFromHex(managerIDString)
	applicationObjectID, parseError := bson.ObjectIDFromHex(applicationIDHex)
	return managerObjectID, applicationObjectID, parseError
}

func (handler *AppHandler) verifyApplicationOwnership(queryContext context.Context, applicationID, managerID bson.ObjectID) bool {
	matchingCount, _ := handler.Database.Database.Collection("applications").CountDocuments(
		queryContext,
		bson.M{"_id": applicationID, "manager_id": managerID},
	)
	return matchingCount > 0
}

func (handler *AppHandler) ListApps(responseWriter http.ResponseWriter, request *http.Request) {
	managerIDString := user.GetManagerID(request.Context())
	managerObjectID, parseError := bson.ObjectIDFromHex(managerIDString)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	applicationsCursor, findError := handler.Database.Database.Collection("applications").Find(queryContext, bson.M{"manager_id": managerObjectID})
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch applications"})
		return
	}
	defer applicationsCursor.Close(queryContext)

	var applications []Application
	if decodeError := applicationsCursor.All(queryContext, &applications); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to decode applications"})
		return
	}

	if applications == nil {
		applications = []Application{}
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

	existingCount, _ := handler.Database.Database.Collection("applications").CountDocuments(queryContext, bson.M{"project_id": createPayload.ProjectID})
	if existingCount > 0 {
		writeJSONResponse(responseWriter, http.StatusConflict, map[string]string{"error": "project_id is already in use"})
		return
	}

	if createPayload.AllowedOrigins == nil {
		createPayload.AllowedOrigins = []string{"*"}
	}

	rawToken, generatedToken, tokenError := GenerateAPIToken("Default Token", 365)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate initial token"})
		return
	}

	currentTime := time.Now()
	newApplication := Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerObjectID,
		Name:                    createPayload.Name,
		ProjectID:               createPayload.ProjectID,
		Description:             createPayload.Description,
		AllowedOrigins:          createPayload.AllowedOrigins,
		AllowNonBrowserRequests: true,
		Tokens:                  []Token{generatedToken},
		CreatedAt:               currentTime,
		UpdatedAt:               currentTime,
	}

	_, insertError := handler.Database.Database.Collection("applications").InsertOne(queryContext, newApplication)
	if insertError != nil {
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

	var foundApplication Application
	findError := handler.Database.Database.Collection("applications").FindOne(
		queryContext,
		bson.M{"_id": applicationObjectID, "manager_id": managerObjectID},
	).Decode(&foundApplication)
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

	updateFields := bson.M{
		"$set": bson.M{
			"name":                        updatePayload.Name,
			"description":                 updatePayload.Description,
			"allowed_origins":             updatePayload.AllowedOrigins,
			"allow_non_browser_requests": updatePayload.AllowNonBrowserRequests,
			"updated_at":                  time.Now(),
		},
	}

	updateResult, updateError := handler.Database.Database.Collection("applications").UpdateOne(
		queryContext,
		bson.M{"_id": applicationObjectID, "manager_id": managerObjectID},
		updateFields,
	)
	if updateError != nil || updateResult.MatchedCount == 0 {
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

	deleteResult, deleteError := handler.Database.Database.Collection("applications").DeleteOne(
		queryContext,
		bson.M{"_id": applicationObjectID, "manager_id": managerObjectID},
	)
	if deleteError != nil || deleteResult.DeletedCount == 0 {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	_, _ = handler.Database.Database.Collection("kv_documents").DeleteMany(queryContext, bson.M{"app_id": applicationObjectID})

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Application and all associated data deleted successfully"})
}

func (handler *AppHandler) CreateToken(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	var tokenPayload CreateTokenRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&tokenPayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	if tokenPayload.Name == "" {
		tokenPayload.Name = "New API Token"
	}

	rawToken, generatedToken, tokenError := GenerateAPIToken(tokenPayload.Name, tokenPayload.ValidityDays)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	updateResult, updateError := handler.Database.Database.Collection("applications").UpdateOne(
		queryContext,
		bson.M{"_id": applicationObjectID, "manager_id": managerObjectID},
		bson.M{"$push": bson.M{"tokens": generatedToken}},
	)

	if updateError != nil || updateResult.MatchedCount == 0 {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusCreated, CreateTokenResponse{
		Token:    generatedToken,
		RawToken: rawToken,
	})
}

func (handler *AppHandler) DeleteToken(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex, tokenID string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	updateResult, updateError := handler.Database.Database.Collection("applications").UpdateOne(
		queryContext,
		bson.M{"_id": applicationObjectID, "manager_id": managerObjectID},
		bson.M{"$pull": bson.M{"tokens": bson.M{"id": tokenID}}},
	)

	if updateError != nil || updateResult.MatchedCount == 0 {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application or token not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Token revoked successfully"})
}

func (handler *AppHandler) GetExplorerCollections(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	if !handler.verifyApplicationOwnership(queryContext, applicationObjectID, managerObjectID) {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	var collectionNames []string
	distinctResult := handler.Database.Database.Collection("kv_documents").Distinct(queryContext, "collection_name", bson.M{"app_id": applicationObjectID})
	if decodeError := distinctResult.Decode(&collectionNames); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch collections"})
		return
	}

	if collectionNames == nil {
		collectionNames = []string{}
	}

	writeJSONResponse(responseWriter, http.StatusOK, collectionNames)
}

func (handler *AppHandler) GetExplorerDocuments(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex, collectionName string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	if !handler.verifyApplicationOwnership(queryContext, applicationObjectID, managerObjectID) {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	pageNumber, _ := strconv.Atoi(request.URL.Query().Get("page"))
	if pageNumber < 1 {
		pageNumber = 1
	}
	pageSizeLimit, _ := strconv.Atoi(request.URL.Query().Get("limit"))
	if pageSizeLimit < 1 || pageSizeLimit > 100 {
		pageSizeLimit = 20
	}

	documentsFilter := bson.M{"app_id": applicationObjectID, "collection_name": collectionName}
	totalDocuments, _ := handler.Database.Database.Collection("kv_documents").CountDocuments(queryContext, documentsFilter)

	documentsToSkip := int64((pageNumber - 1) * pageSizeLimit)
	findOptions := options.Find().SetSkip(documentsToSkip).SetLimit(int64(pageSizeLimit)).SetSort(bson.M{"created_at": -1})

	documentsCursor, findError := handler.Database.Database.Collection("kv_documents").Find(queryContext, documentsFilter, findOptions)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to query documents"})
		return
	}
	defer documentsCursor.Close(queryContext)

	var documents []bson.M
	if decodeError := documentsCursor.All(queryContext, &documents); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to decode documents"})
		return
	}

	if documents == nil {
		documents = []bson.M{}
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"data":        documents,
		"total":       totalDocuments,
		"page":        pageNumber,
		"limit":       pageSizeLimit,
		"total_pages": (totalDocuments + int64(pageSizeLimit) - 1) / int64(pageSizeLimit),
	})
}
