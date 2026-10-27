package tokens

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	tokensRepo "pocketrun-api/internal/domain/application/repositories/tokens"
	appUtils "pocketrun-api/internal/domain/application/utils"
)

type Handler struct {
	TokensRepository *tokensRepo.Repository
}

func NewHandler(tokensRepository *tokensRepo.Repository) *Handler {
	return &Handler{
		TokensRepository: tokensRepository,
	}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func (handler *Handler) CreateToken(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex string) {
	managerObjectID, applicationObjectID, parseError := appUtils.ParseManagerAndApplicationIDs(request, applicationIDHex)
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

	rawToken, generatedToken, tokenError := appUtils.GenerateAPIToken(tokenPayload.Name, tokenPayload.ValidityDays)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	matched, updateError := handler.TokensRepository.AddToken(queryContext, applicationObjectID, managerObjectID, generatedToken)
	if updateError != nil || !matched {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusCreated, CreateTokenResponse{
		Token:    generatedToken,
		RawToken: rawToken,
	})
}

func (handler *Handler) DeleteToken(responseWriter http.ResponseWriter, request *http.Request, applicationIDHex, tokenID string) {
	managerObjectID, applicationObjectID, parseError := appUtils.ParseManagerAndApplicationIDs(request, applicationIDHex)
	if parseError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid app ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	matched, updateError := handler.TokensRepository.RemoveToken(queryContext, applicationObjectID, managerObjectID, tokenID)
	if updateError != nil || !matched {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "Application or token not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"message": "Token revoked successfully"})
}

