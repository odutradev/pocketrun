package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	AppKey       contextKey = "appKey"
	ProjectIDKey contextKey = "projectIDKey"
)

func AppAuth(db *database.MongoDB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from controlAccess, X-Pocket-Token, or Authorization
			rawToken := r.Header.Get("controlAccess")
			if rawToken == "" {
				rawToken = r.Header.Get("X-Pocket-Token")
			}
			if rawToken == "" {
				authHeader := r.Header.Get("Authorization")
				if strings.HasPrefix(authHeader, "Bearer ") {
					rawToken = strings.TrimPrefix(authHeader, "Bearer ")
				}
			}

			if rawToken == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Application access token missing. Provide controlAccess or X-Pocket-Token header."})
				return
			}

			tokenHash := application.HashAPIToken(rawToken)

			ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
			defer cancel()

			var app application.Application
			err := db.Database.Collection("applications").FindOne(ctx, bson.M{
				"tokens.token_hash": tokenHash,
			}).Decode(&app)

			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Invalid application access token"})
				return
			}

			// Validate token expiration
			var matchedToken *application.Token
			for i, t := range app.Tokens {
				if t.TokenHash == tokenHash {
					matchedToken = &app.Tokens[i]
					break
				}
			}

			if matchedToken != nil && matchedToken.ExpiresAt != nil && time.Now().After(*matchedToken.ExpiresAt) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "Application access token has expired"})
				return
			}

			// Validate Origin
			originHeader := r.Header.Get("Origin")
			if !application.IsOriginAllowed(app.AllowedOrigins, originHeader, app.AllowNonBrowserRequests) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				json.NewEncoder(w).Encode(map[string]string{
					"error":  "Access denied: Origin not allowed for this application",
					"origin": originHeader,
				})
				return
			}

			// Set CORS headers dynamically based on origin
			if originHeader != "" {
				w.Header().Set("Access-Control-Allow-Origin", originHeader)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, controlAccess, X-Pocket-Token, Authorization")
			w.Header().Set("projectID", app.ProjectID)

			// Handle CORS Preflight OPTIONS
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			// Update last_used_at asynchronously
			go func(appID bson.ObjectID, tokHash string) {
				updateCtx, updateCancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer updateCancel()
				now := time.Now()
				_, _ = db.Database.Collection("applications").UpdateOne(
					updateCtx,
					bson.M{"_id": appID, "tokens.token_hash": tokHash},
					bson.M{"$set": bson.M{"tokens.$.last_used_at": now}},
				)
			}(app.ID, tokenHash)

			reqCtx := context.WithValue(r.Context(), AppKey, &app)
			reqCtx = context.WithValue(reqCtx, ProjectIDKey, app.ProjectID)

			next.ServeHTTP(w, r.WithContext(reqCtx))
		})
	}
}

func GetAppFromContext(ctx context.Context) *application.Application {
	if val, ok := ctx.Value(AppKey).(*application.Application); ok {
		return val
	}
	return nil
}

func GetProjectIDFromContext(ctx context.Context) string {
	if val, ok := ctx.Value(ProjectIDKey).(string); ok {
		return val
	}
	return ""
}
