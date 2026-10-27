package status

type StatusResponse struct {
	SetupRequired bool `json:"setup_required"`
	HasUsers      bool `json:"has_users"`
}

