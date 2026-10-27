package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"
)

func (handler *AppHandler) GetExplorerCollections(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := parseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	if !handler.AppRepository.VerifyOwnership(queryContext, applicationObjectID, managerObjectID) {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	collectionNames, findError := handler.KVRepository.FindDistinctCollectionsByAppID(queryContext, applicationObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch collections"})
		return
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

	if !handler.AppRepository.VerifyOwnership(queryContext, applicationObjectID, managerObjectID) {
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

	documents, totalDocuments, findError := handler.KVRepository.FindExplorerDocuments(
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

	writeJSONResponse(responseWriter, http.StatusOK, map[string]any{
		"data":        documents,
		"total":       totalDocuments,
		"page":        pageNumber,
		"limit":       pageSizeLimit,
		"total_pages": (totalDocuments + int64(pageSizeLimit) - 1) / int64(pageSizeLimit),
	})
}
