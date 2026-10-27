package health

import (
	"encoding/json"
	"net/http"
)

type PingResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func Ping(responseWriter http.ResponseWriter, request *http.Request) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	pingResponse := PingResponse{
		Status:  "success",
		Message: "pong",
	}

	_ = json.NewEncoder(responseWriter).Encode(pingResponse)
}

func RegisterRoutes(routeMux *http.ServeMux) {
	routeMux.HandleFunc("GET /ping", Ping)
}
