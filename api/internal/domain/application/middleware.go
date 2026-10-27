package application

import (
	"context"
	"net/http"
	"strings"
	"time"

	"pocketrun-api/internal/database"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type contextKey string

const (
	AppKey       contextKey = "appKey"
	ProjectIDKey contextKey = "projectIDKey"
)

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

func findMatchingToken(tokens []Token, tokenHash string) *Token {
	for tokenIndex := range tokens {
		if tokens[tokenIndex].TokenHash == tokenHash {
			return &tokens[tokenIndex]
		}
	}
	return nil
}

func isTokenExpired(token *Token) bool {
	return token != nil && token.ExpiresAt != nil && time.Now().After(*token.ExpiresAt)
}

func updateTokenLastUsedAt(mongoDatabase *database.MongoDB, applicationID bson.ObjectID, tokenHash string) {
	updateContext, cancelUpdate := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelUpdate()

	currentTime := time.Now()
	_, _ = mongoDatabase.Database.Collection("applications").UpdateOne(
		updateContext,
		bson.M{"_id": applicationID, "tokens.token_hash": tokenHash},
		bson.M{"$set": bson.M{"tokens.$.last_used_at": currentTime}},
	)
}

func AppAuth(mongoDatabase *database.MongoDB) func(http.Handler) http.Handler {
	return func(nextHandler http.Handler) http.Handler {
		return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
			rawToken := extractAccessToken(request)
			if rawToken == "" {
				writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{
					"error": "Application access token missing. Provide controlAccess or X-Pocket-Token header.",
				})
				return
			}

			tokenHash := HashAPIToken(rawToken)

			queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
			defer cancelQuery()

			var foundApplication Application
			findError := mongoDatabase.Database.Collection("applications").FindOne(queryContext, bson.M{
				"tokens.token_hash": tokenHash,
			}).Decode(&foundApplication)

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
			if !IsOriginAllowed(foundApplication.AllowedOrigins, originHeader, foundApplication.AllowNonBrowserRequests) {
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

			go updateTokenLastUsedAt(mongoDatabase, foundApplication.ID, tokenHash)

			authenticatedContext := context.WithValue(request.Context(), AppKey, &foundApplication)
			authenticatedContext = context.WithValue(authenticatedContext, ProjectIDKey, foundApplication.ProjectID)

			nextHandler.ServeHTTP(responseWriter, request.WithContext(authenticatedContext))
		})
	}
}

func GetAppFromContext(requestContext context.Context) *Application {
	if applicationInstance, exists := requestContext.Value(AppKey).(*Application); exists {
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
