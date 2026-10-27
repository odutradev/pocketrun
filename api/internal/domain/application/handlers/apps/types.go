package apps

import (
	appsRepo "pocketrun-api/internal/domain/application/repositories/apps"
)

type CreateAppRequest struct {
	Name                    string   `json:"name"`
	ProjectID               string   `json:"project_id"`
	Description             string   `json:"description"`
	AllowedOrigins          []string `json:"allowed_origins"`
	AllowNonBrowserRequests bool     `json:"allow_non_browser_requests"`
}

type CreateAppResponse struct {
	Application appsRepo.Application `json:"application"`
	RawToken    string               `json:"raw_token"`
}
