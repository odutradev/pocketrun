package handler

import (
	"encoding/json"
	"net/http"
)

type PingResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func Ping(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	response := PingResponse{
		Status:  "success",
		Message: "pong",
	}

	json.NewEncoder(w).Encode(response)
}
