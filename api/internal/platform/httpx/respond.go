package httpx

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error  string            `json:"error"`
	Fields map[string]string `json:"fields,omitempty"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

func WriteJSON(w http.ResponseWriter, status int, payload any) {
	body, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, `{"error":"internal_error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if _, err := w.Write(body); err != nil {
		return
	}
}

func WriteError(w http.ResponseWriter, status int, code string) {
	WriteJSON(w, status, ErrorResponse{Error: code})
}

func WriteMessage(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, MessageResponse{Message: message})
}
