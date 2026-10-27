package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"pocketrun-api/internal/domain/application/repositories"
)

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

	rawToken, generatedToken, tokenError := repositories.GenerateAPIToken(tokenPayload.Name, tokenPayload.ValidityDays)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	matched, updateError := handler.AppRepository.AddToken(queryContext, applicationObjectID, managerObjectID, generatedToken)
	if updateError != nil || !matched {
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

	matched, updateError := handler.AppRepository.RemoveToken(queryContext, applicationObjectID, managerObjectID, tokenID)
	if updateError != nil || !matched {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application or token not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Token revoked successfully"})
}
