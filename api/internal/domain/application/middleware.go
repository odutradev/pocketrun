package application

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type contextKey string

const (
	AppKey       contextKey = "appKey"
	ProjectIDKey contextKey = "projectIDKey"
)

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func extractAccessToken(request *http.Request) string {
	if controlAccessToken := request.Header.Get("controlAccess"); controlAccessToken != "" {
		return controlAccessToken
	}
	if pocketToken := request.Header.Get("X-Pocket-Token"); pocketToken != "" {
		return pocketToken
	}
	authorizationHeader := request.Header.Get("Authorization")
	if strings.HasPrefix(authorizationHeader, "Bearer ") {
		return strings.TrimPrefix(authorizationHeader, "Bearer ")
	}
	return ""
}

func findMatchingToken(tokens []repositories.Token, tokenHash string) *repositories.Token {
	for tokenIndex := range tokens {
		if tokens[tokenIndex].TokenHash == tokenHash {
			return &tokens[tokenIndex]
		}
	}
	return nil
}

func isTokenExpired(token *repositories.Token) bool {
	return token != nil && token.ExpiresAt != nil && time.Now().After(*token.ExpiresAt)
}

func updateTokenLastUsedAt(appRepository *repositories.ApplicationRepository, applicationID bson.ObjectID, tokenHash string) {
	updateContext, cancelUpdate := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelUpdate()

	_ = appRepository.UpdateTokenLastUsedAt(updateContext, applicationID, tokenHash)
}

func AppAuth(mongoDatabase *database.MongoDB) func(http.Handler) http.Handler {
	appRepository := repositories.NewApplicationRepository(mongoDatabase)

	return func(nextHandler http.Handler) http.Handler {
		return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
			rawToken := extractAccessToken(request)
			if rawToken == "" {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Application access token missing. Provide controlAccess or X-Pocket-Token header.",
				})
				return
			}

			tokenHash := repositories.HashAPIToken(rawToken)

			queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
			defer cancelQuery()

			foundApplication, findError := appRepository.FindByTokenHash(queryContext, tokenHash)
			if findError != nil {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Invalid application access token",
				})
				return
			}

			matchedToken := findMatchingToken(foundApplication.Tokens, tokenHash)
			if isTokenExpired(matchedToken) {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Application access token has expired",
				})
				return
			}

			originHeader := request.Header.Get("Origin")
			if !repositories.IsOriginAllowed(foundApplication.AllowedOrigins, originHeader, foundApplication.AllowNonBrowserRequests) {
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

			go updateTokenLastUsedAt(appRepository, foundApplication.ID, tokenHash)

			authenticatedContext := context.WithValue(request.Context(), AppKey, foundApplication)
			authenticatedContext = context.WithValue(authenticatedContext, ProjectIDKey, foundApplication.ProjectID)

			nextHandler.ServeHTTP(responseWriter, request.WithContext(authenticatedContext))
		})
	}
}

func GetAppFromContext(requestContext context.Context) *repositories.Application {
	if applicationInstance, exists := requestContext.Value(AppKey).(*repositories.Application); exists {
		return applicationInstance
	}
	return nil
}

func GetProjectIDFromContext(requestContext context.Context) string {
	if projectID, exists := requestContext.Value(ProjectIDKey).(string); exists {
		return projectID
	}
	return ""
}
