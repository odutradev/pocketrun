package kv

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type KVHandler struct {
	Database *database.MongoDB
}

func NewKVHandler(mongoDatabase *database.MongoDB) *KVHandler {
	return &KVHandler{Database: mongoDatabase}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func buildCollectionQueryFilter(applicationID bson.ObjectID, collectionName string, queryParameters url.Values) bson.M {
	queryFilter := bson.M{
		"app_id":          applicationID,
		"collection_name": collectionName,
	}

	for parameterKey, parameterValues := range queryParameters {
		if parameterKey == "page" || parameterKey == "limit" || parameterKey == "pagination" {
			continue
		}
		if len(parameterValues) > 0 {
			rawValue := parameterValues[0]
			if booleanValue, parseBoolError := strconv.ParseBool(rawValue); parseBoolError == nil {
				queryFilter["data."+parameterKey] = booleanValue
			} else if numericValue, parseFloatError := strconv.ParseFloat(rawValue, 64); parseFloatError == nil {
				queryFilter["data."+parameterKey] = numericValue
			} else {
				queryFilter["data."+parameterKey] = rawValue
			}
		}
	}

	return queryFilter
}

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

func (handler *KVHandler) Create(responseWriter http.ResponseWriter, request *http.Request, collectionName string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	var createPayload CreateKVRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&createPayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	if createPayload.Data == nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Field 'data' is required"})
		return
	}

	currentTime := time.Now()
	var expirationDate *time.Time
	if createPayload.ExpiresInDays > 0 {
		calculatedExpiration := currentTime.AddDate(0, 0, createPayload.ExpiresInDays)
		expirationDate = &calculatedExpiration
	}

	newDocument := KVDocument{
		ID:             bson.NewObjectID(),
		AppID:          authenticatedApplication.ID,
		ProjectID:      authenticatedApplication.ProjectID,
		CollectionName: collectionName,
		Data:           createPayload.Data,
		ExpiresAt:      expirationDate,
		CreatedAt:      currentTime,
		UpdatedAt:      currentTime,
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	_, insertError := handler.Database.Database.Collection("kv_documents").InsertOne(queryContext, newDocument)
	if insertError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to create document"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusCreated, newDocument)
}

func (handler *KVHandler) GetAll(responseWriter http.ResponseWriter, request *http.Request, collectionName string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	queryParameters := request.URL.Query()
	queryFilter := buildCollectionQueryFilter(authenticatedApplication.ID, collectionName, queryParameters)

	pageNumber, _ := strconv.Atoi(queryParameters.Get("page"))
	if pageNumber < 1 {
		pageNumber = 1
	}

	pageSizeLimit, _ := strconv.Atoi(queryParameters.Get("limit"))
	if pageSizeLimit < 1 || pageSizeLimit > 500 {
		pageSizeLimit = 50
	}

	usePagination := queryParameters.Get("pagination") == "true" || queryParameters.Get("page") != "" || queryParameters.Get("limit") != ""

	findOptions := options.Find().SetSort(bson.M{"created_at": -1})
	if usePagination {
		documentsToSkip := int64((pageNumber - 1) * pageSizeLimit)
		findOptions.SetSkip(documentsToSkip).SetLimit(int64(pageSizeLimit))
	}

	totalDocuments, _ := handler.Database.Database.Collection("kv_documents").CountDocuments(queryContext, queryFilter)

	documentsCursor, findError := handler.Database.Database.Collection("kv_documents").Find(queryContext, queryFilter, findOptions)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch documents"})
		return
	}
	defer documentsCursor.Close(queryContext)

	var documents []KVDocument
	if decodeError := documentsCursor.All(queryContext, &documents); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to decode documents"})
		return
	}

	if documents == nil {
		documents = []KVDocument{}
	}

	if usePagination {
		writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
			"data":        documents,
			"total":       totalDocuments,
			"page":        pageNumber,
			"limit":       pageSizeLimit,
			"total_pages": (totalDocuments + int64(pageSizeLimit) - 1) / int64(pageSizeLimit),
		})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, documents)
}

func (handler *KVHandler) GetByID(responseWriter http.ResponseWriter, request *http.Request, collectionName, documentIDHex string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	documentObjectID, parseError := bson.ObjectIDFromHex(documentIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid document ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	var foundDocument KVDocument
	findError := handler.Database.Database.Collection("kv_documents").FindOne(queryContext, bson.M{
		"_id":             documentObjectID,
		"app_id":          authenticatedApplication.ID,
		"collection_name": collectionName,
	}).Decode(&foundDocument)

	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Document not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, foundDocument)
}

func (handler *KVHandler) Update(responseWriter http.ResponseWriter, request *http.Request, collectionName, documentIDHex string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	documentObjectID, parseError := bson.ObjectIDFromHex(documentIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid document ID"})
		return
	}

	var updatePayload UpdateKVRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&updatePayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	updateFields := bson.M{
		"$set": bson.M{
			"data":       updatePayload.Data,
			"updated_at": time.Now(),
		},
	}

	updateResult, updateError := handler.Database.Database.Collection("kv_documents").UpdateOne(queryContext, bson.M{
		"_id":             documentObjectID,
		"app_id":          authenticatedApplication.ID,
		"collection_name": collectionName,
	}, updateFields)

	if updateError != nil || updateResult.MatchedCount == 0 {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Document not found or update failed"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Document updated successfully"})
}

func (handler *KVHandler) Delete(responseWriter http.ResponseWriter, request *http.Request, collectionName, documentIDHex string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	documentObjectID, parseError := bson.ObjectIDFromHex(documentIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid document ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	deleteResult, deleteError := handler.Database.Database.Collection("kv_documents").DeleteOne(queryContext, bson.M{
		"_id":             documentObjectID,
		"app_id":          authenticatedApplication.ID,
		"collection_name": collectionName,
	})

	if deleteError != nil || deleteResult.DeletedCount == 0 {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Document not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Document deleted successfully"})
}

func (handler *KVHandler) DeleteAllCollection(responseWriter http.ResponseWriter, request *http.Request, collectionName string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancelQuery()

	deleteResult, deleteError := handler.Database.Database.Collection("kv_documents").DeleteMany(queryContext, bson.M{
		"app_id":          authenticatedApplication.ID,
		"collection_name": collectionName,
	})

	if deleteError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to delete collection"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"message":       "Collection cleared successfully",
		"deleted_count": deleteResult.DeletedCount,
	})
}

func (handler *KVHandler) DeleteAllProject(responseWriter http.ResponseWriter, request *http.Request) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancelQuery()

	deleteResult, deleteError := handler.Database.Database.Collection("kv_documents").DeleteMany(queryContext, bson.M{
		"app_id": authenticatedApplication.ID,
	})

	if deleteError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to delete project data"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"message":       "All project data cleared successfully",
		"deleted_count": deleteResult.DeletedCount,
	})
}
