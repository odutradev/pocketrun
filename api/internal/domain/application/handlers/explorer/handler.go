package explorer

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	appsRepo "pocketrun-api/internal/domain/application/repositories/apps"
	kvDocumentsRepo "pocketrun-api/internal/domain/kv/repositories/documents"
	"pocketrun-api/internal/domain/user"

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
	managerIDString := user.GetManagerID(request.Context())
	managerObjectID, _ := bson.ObjectIDFromHex(managerIDString)
	applicationObjectID, parseError := bson.ObjectIDFromHex(applicationIDHex)
	return managerObjectID, applicationObjectID, parseError
}

func (handler *Handler) GetExplorerCollections(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	if !handler.AppsRepository.VerifyOwnership(queryContext, applicationObjectID, managerObjectID) {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	collectionNames, findError := handler.KVDocumentsRepository.FindDistinctCollectionsByAppID(queryContext, applicationObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch collections"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, collectionNames)
}

func (handler *Handler) GetExplorerDocuments(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex, collectionName string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	if !handler.AppsRepository.VerifyOwnership(queryContext, applicationObjectID, managerObjectID) {
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

	documents, totalDocuments, findError := handler.KVDocumentsRepository.FindExplorerDocuments(
		queryContext,
		applicationObjectID,
		collectionName,
		pageNumber,
		pageSizeLimit,
	)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to query documents"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, ExplorerDocumentsResponse{
		Data:       documents,
		Total:      totalDocuments,
		Page:       pageNumber,
		Limit:      pageSizeLimit,
		TotalPages: (totalDocuments + int64(pageSizeLimit) - 1) / int64(pageSizeLimit),
	})
}

