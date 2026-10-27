package user

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"pocketrun-api/internal/domain/user/repositories"
)

func ManagerAuth() func(http.Handler) http.Handler {
	return func(nextHandler http.Handler) http.Handler {
		return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
			authorizationHeader := request.Header.Get("Authorization")
			if authorizationHeader == "" {
				responseWriter.Header().Set("Content-Type", "application/json")
				responseWriter.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(responseWriter).Encode(map[string]string{"error": "Authorization header missing"})
				return
			}

			headerParts := strings.SplitN(authorizationHeader, " ", 2)
			if len(headerParts) != 2 || !strings.EqualFold(headerParts[0], "Bearer") {
				responseWriter.Header().Set("Content-Type", "application/json")
				responseWriter.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(responseWriter).Encode(map[string]string{"error": "Invalid authorization header format (expected Bearer <token>)"})
				return
			}

			tokenClaims, validationError := repositories.ValidateJWT(headerParts[1])
			if validationError != nil {
				responseWriter.Header().Set("Content-Type", "application/json")
				responseWriter.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(responseWriter).Encode(map[string]string{"error": "Unauthorized: " + validationError.Error()})
				return
			}

			authenticatedContext := context.WithValue(request.Context(), repositories.UserIDKey, tokenClaims.UserID)
			authenticatedContext = context.WithValue(authenticatedContext, repositories.UserEmailKey, tokenClaims.Email)

			nextHandler.ServeHTTP(responseWriter, request.WithContext(authenticatedContext))
		})
	}
}

func GetManagerID(requestContext context.Context) string {
	return repositories.GetManagerID(requestContext)
}

func GetManagerEmail(requestContext context.Context) string {
	return repositories.GetManagerEmail(requestContext)
}
