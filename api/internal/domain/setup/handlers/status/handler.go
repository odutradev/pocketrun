package status

import (
	"context"
	"encoding/json"
	"log"
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

func CheckInitialStatus(usersRepository *usersRepo.Repository) {
	if !usersRepository.IsAvailable() {
		log.Println("[Setup] Warning: Database unavailable for initial status check")
		return
	}

	queryContext, cancelQuery := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := usersRepository.CountUsers(queryContext)
	if countError != nil {
		log.Printf("[Setup] Warning: Could not verify users count: %v", countError)
		return
	}

	if usersCount == 0 {
		log.Println("==================================================================")
		log.Println("  [PocketRun] INITIAL SETUP REQUIRED (Dokploy-style onboarding)  ")
		log.Println("  No users found in database. Initial setup mode is ACTIVE.       ")
		log.Println("  Access the web console to configure the initial Superadmin.     ")
		log.Println("==================================================================")
		return
	}

	log.Printf("[Setup] Platform operational with %d registered manager(s).", usersCount)
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
