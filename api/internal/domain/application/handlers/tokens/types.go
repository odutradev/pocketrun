package tokens

import (
	tokensRepo "pocketrun-api/internal/domain/application/repositories/tokens"
)

type CreateTokenRequest struct {
	Name         string `json:"name"`
	ValidityDays int    `json:"validity_days"`
}

type CreateTokenResponse struct {
	Token    tokensRepo.Token `json:"token"`
	RawToken string           `json:"raw_token"`
}

