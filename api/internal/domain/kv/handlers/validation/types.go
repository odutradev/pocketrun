package validation

type ValidateControlAccessResponse struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	ProjectID string `json:"project_id"`
	AppName   string `json:"app_name"`
}

