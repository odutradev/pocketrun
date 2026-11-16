package setup

import "errors"

var ErrSetupCompleted = errors.New("setup already completed")

type Status struct {
	SetupRequired bool `json:"setupRequired"`
	HasUsers      bool `json:"hasUsers"`
}
