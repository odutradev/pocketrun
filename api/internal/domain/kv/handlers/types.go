package handlers

type CreateKVRequest struct {
	Data          map[string]any `json:"data"`
	ExpiresInDays int            `json:"expiresInDays,omitempty"`
}

type UpdateKVRequest struct {
	Data map[string]any `json:"data"`
}
