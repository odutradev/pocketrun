package documents

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"pocketrun-api/internal/domain/application"
	documentsRepo "pocketrun-api/internal/domain/kv/repositories/documents"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Handler struct {
	Repository *documentsRepo.Repository
}

func NewHandler(repository *documentsRepo.Repository) *Handler {
	return &Handler{Repository: repository}
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

func (handler *Handler) Create(responseWriter http.ResponseWriter, request *http.Request, collectionName string) {
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

	newDocument := documentsRepo.KVDocument{
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

	if insertError := handler.Repository.Create(queryContext, newDocument); insertError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to create document"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusCreated, newDocument)
}

func (handler *Handler) GetAll(responseWriter http.ResponseWriter, request *http.Request, collectionName string) {
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

	documents, totalDocuments, findError := handler.Repository.FindByFilter(queryContext, queryFilter, pageNumber, pageSizeLimit, usePagination)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch documents"})
		return
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

func (handler *Handler) GetByID(responseWriter http.ResponseWriter, request *http.Request, collectionName, documentIDHex string) {
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

	foundDocument, findError := handler.Repository.FindByID(queryContext, authenticatedApplication.ID, collectionName, documentObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Document not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, foundDocument)
}

func (handler *Handler) Update(responseWriter http.ResponseWriter, request *http.Request, collectionName, documentIDHex string) {
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

	matched, updateError := handler.Repository.UpdateByID(queryContext, authenticatedApplication.ID, collectionName, documentObjectID, updatePayload.Data)
	if updateError != nil || !matched {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Document not found or update failed"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Document updated successfully"})
}

func (handler *Handler) Delete(responseWriter http.ResponseWriter, request *http.Request, collectionName, documentIDHex string) {
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

	deleted, deleteError := handler.Repository.DeleteByID(queryContext, authenticatedApplication.ID, collectionName, documentObjectID)
	if deleteError != nil || !deleted {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Document not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Document deleted successfully"})
}

func (handler *Handler) DeleteAllCollection(responseWriter http.ResponseWriter, request *http.Request, collectionName string) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancelQuery()

	deletedCount, deleteError := handler.Repository.DeleteByCollection(queryContext, authenticatedApplication.ID, collectionName)
	if deleteError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to delete collection"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"message":       "Collection cleared successfully",
		"deleted_count": deletedCount,
	})
}

func (handler *Handler) DeleteAllProject(responseWriter http.ResponseWriter, request *http.Request) {
	authenticatedApplication := application.GetAppFromContext(request.Context())
	if authenticatedApplication == nil {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancelQuery()

	deletedCount, deleteError := handler.Repository.DeleteByAppID(queryContext, authenticatedApplication.ID)
	if deleteError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to delete project data"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"message":       "All project data cleared successfully",
		"deleted_count": deletedCount,
	})
}
