package application

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"pocketrun-api/internal/database"
	appsRepo "pocketrun-api/internal/domain/application/repositories/apps"
	tokensRepo "pocketrun-api/internal/domain/application/repositories/tokens"
	appUtils "pocketrun-api/internal/domain/application/utils"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func updateTokenLastUsedAt(tokensRepository *tokensRepo.Repository, applicationID bson.ObjectID, tokenHash string) {
	updateContext, cancelUpdate := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelUpdate()

	_ = tokensRepository.UpdateTokenLastUsedAt(updateContext, applicationID, tokenHash)
}

func AppAuth(mongoDatabase *database.MongoDB) func(http.Handler) http.Handler {
	appsRepository := appsRepo.NewRepository(mongoDatabase)
	tokensRepository := tokensRepo.NewRepository(mongoDatabase)

	return func(nextHandler http.Handler) http.Handler {
		return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
			rawToken := appUtils.ExtractAccessToken(request)
			if rawToken == "" {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Application access token missing. Provide controlAccess or X-Pocket-Token header.",
				})
				return
			}

			tokenHash := appUtils.HashAPIToken(rawToken)

			queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
			defer cancelQuery()

			foundApplication, findError := appsRepository.FindByTokenHash(queryContext, tokenHash)
			if findError != nil {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Invalid application access token",
				})
				return
			}

			matchedToken := appUtils.FindMatchingToken(foundApplication.Tokens, tokenHash)
			if appUtils.IsTokenExpired(matchedToken) {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Application access token has expired",
				})
				return
			}

			originHeader := request.Header.Get("Origin")
			if !appUtils.IsOriginAllowed(foundApplication.AllowedOrigins, originHeader, foundApplication.AllowNonBrowserRequests) {
				writeJSONResponse(responseWriter, http.StatusForbidden, map[string]string{
					"error":  "Access denied: Origin not allowed for this application",
					"origin": originHeader,
				})
				return
			}

			if originHeader != "" {
				responseWriter.Header().Set("Access-Control-Allow-Origin", originHeader)
			} else {
				responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
			}
			responseWriter.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type, controlAccess, X-Pocket-Token, Authorization")
			responseWriter.Header().Set("projectID", foundApplication.ProjectID)

			if request.Method == http.MethodOptions {
				responseWriter.WriteHeader(http.StatusNoContent)
				return
			}

			go updateTokenLastUsedAt(tokensRepository, foundApplication.ID, tokenHash)

			authenticatedContext := context.WithValue(request.Context(), appUtils.AppKey, foundApplication)
			authenticatedContext = context.WithValue(authenticatedContext, appUtils.ProjectIDKey, foundApplication.ProjectID)

			nextHandler.ServeHTTP(responseWriter, request.WithContext(authenticatedContext))
		})
	}
}
