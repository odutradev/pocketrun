package apps

import (
	"strings"
	"time"

	"pocketrun-api/internal/domain/application/repositories/tokens"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Application struct {
	ID                      bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	ManagerID               bson.ObjectID  `bson:"manager_id" json:"manager_id"`
	Name                    string         `bson:"name" json:"name"`
	ProjectID               string         `bson:"project_id" json:"project_id"`
	Description             string         `bson:"description" json:"description"`
	AllowedOrigins          []string       `bson:"allowed_origins" json:"allowed_origins"`
	AllowNonBrowserRequests bool           `bson:"allow_non_browser_requests" json:"allow_non_browser_requests"`
	Tokens                  []tokens.Token `bson:"tokens" json:"tokens,omitempty"`
	CreatedAt               time.Time      `bson:"created_at" json:"created_at"`
	UpdatedAt               time.Time      `bson:"updated_at" json:"updated_at"`
}

func IsOriginAllowed(allowedOrigins []string, originHeader string, allowNonBrowserRequests bool) bool {
	trimmedOrigin := strings.TrimSpace(originHeader)

	if trimmedOrigin == "" {
		return allowNonBrowserRequests
	}

	trimmedOrigin = strings.TrimSuffix(trimmedOrigin, "/")

	for _, allowedOrigin := range allowedOrigins {
		allowedOrigin = strings.TrimSpace(allowedOrigin)
		if allowedOrigin == "*" {
			return true
		}
		normalizedAllowedOrigin := strings.TrimSuffix(allowedOrigin, "/")
		if strings.EqualFold(normalizedAllowedOrigin, trimmedOrigin) {
			return true
		}
	}

	return false
}
