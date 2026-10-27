package status

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	usersRepo "pocketrun-api/internal/domain/user/repositories/users"
)

type Handler struct {
	UsersRepository *usersRepo.Repository
}

func NewHandler(usersRepository *usersRepo.Repository) *Handler {
	return &Handler{
		UsersRepository: usersRepository,
	}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func (handler *Handler) GetStatus(responseWriter http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodGet {
		http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !handler.UsersRepository.IsAvailable() {
		writeJSONResponse(responseWriter, http.StatusServiceUnavailable, map[string]string{"error": "Database unavailable"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := handler.UsersRepository.CountUsers(queryContext)
	if countError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to check setup status"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, StatusResponse{
		SetupRequired: usersCount == 0,
		HasUsers:      usersCount > 0,
	})
}

