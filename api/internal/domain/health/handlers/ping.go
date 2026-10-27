package handlers

import (
	"encoding/json"
	"net/http"
)

func Ping(responseWriter http.ResponseWriter, request *http.Request) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	pingResponse := PingResponse{
		Status:  "success",
		Message: "pong",
	}

	_ = json.NewEncoder(responseWriter).Encode(pingResponse)
}
