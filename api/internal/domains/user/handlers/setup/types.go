package setup

import (
	"errors"

	"pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/domains/user/utils/setuptoken"
)

const MaxTokenFailures = 5

var (
	ErrSetupCompleted    = errors.New("setup already completed")
	ErrInvalidSetupToken = errors.New("invalid setup token")
)

type Status struct {
	SetupRequired bool `json:"setupRequired"`
	HasUsers      bool `json:"hasUsers"`
}

type TokenInput struct {
	SetupToken string `json:"setupToken" validate:"required,max=32"`
}

func (i *TokenInput) Normalize() {
	i.SetupToken = setuptoken.Normalize(i.SetupToken)
}

type CreateAdminInput struct {
	user.CreateInput
	SetupToken string `json:"setupToken" validate:"required,max=32"`
}

func (i *CreateAdminInput) Normalize() {
	i.CreateInput.Normalize()
	i.SetupToken = setuptoken.Normalize(i.SetupToken)
}
