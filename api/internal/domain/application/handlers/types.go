package handlers

import (
	"pocketrun-api/internal/domain/application/repositories"
)

type CreateAppRequest struct {
	Name                    string   `json:"name"`
	ProjectID               string   `json:"project_id"`
	Description             string   `json:"description"`
	AllowedOrigins          []string `json:"allowed_origins"`
	AllowNonBrowserRequests bool     `json:"allow_non_browser_requests"`
}

type CreateAppResponse struct {
	Application repositories.Application `json:"application"`
	RawToken    string                   `json:"raw_token"`
}

type CreateTokenRequest struct {
	Name         string `json:"name"`
	ValidityDays int    `json:"validity_days"`
}

type CreateTokenResponse struct {
	Token    repositories.Token `json:"token"`
	RawToken string             `json:"raw_token"`
}
