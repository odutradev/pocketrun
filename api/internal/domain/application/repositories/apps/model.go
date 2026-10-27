package apps

import (
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
