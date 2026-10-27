package admin

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"sync"
	"time"

	setupUtils "pocketrun-api/internal/domain/setup/utils"
	usersRepo "pocketrun-api/internal/domain/user/repositories/users"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Handler struct {
	UsersRepository *usersRepo.Repository
	setupMutex      sync.Mutex
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

func (handler *Handler) SetupAdmin(responseWriter http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if !handler.UsersRepository.IsAvailable() {
		writeJSONResponse(responseWriter, http.StatusServiceUnavailable, map[string]string{"error": "Database unavailable"})
		return
	}

	handler.setupMutex.Lock()
	defer handler.setupMutex.Unlock()

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := handler.UsersRepository.CountUsers(queryContext)
	if countError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Database error checking system status"})
		return
	}

	if usersCount > 0 {
		writeJSONResponse(responseWriter, http.StatusForbidden, map[string]string{"error": "Initial setup has already been completed"})
		return
	}

	var setupPayload SetupAdminRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&setupPayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
		return
	}

	setupPayload.Name = strings.TrimSpace(setupPayload.Name)
	setupPayload.Email = strings.ToLower(strings.TrimSpace(setupPayload.Email))

	if setupPayload.Name == "" || setupPayload.Email == "" || setupPayload.Password == "" {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "All fields (name, email, password) are required"})
		return
	}

	if len(setupPayload.Name) < 2 || len(setupPayload.Name) > 100 {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Name must be between 2 and 100 characters"})
		return
	}

	if _, parseEmailError := mail.ParseAddress(setupPayload.Email); parseEmailError != nil || !strings.Contains(setupPayload.Email, ".") {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid email address format"})
		return
	}

	if validationError := setupUtils.ValidateStrongPassword(setupPayload.Password); validationError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": validationError.Error()})
		return
	}

	passwordHash, hashError := usersRepo.HashPassword(setupPayload.Password)
	if hashError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to securely hash password"})
		return
	}

	currentTime := time.Now()
	newSuperadmin := usersRepo.User{
		ID:           bson.NewObjectID(),
		Name:         setupPayload.Name,
		Email:        setupPayload.Email,
		Role:         "superadmin",
		PasswordHash: passwordHash,
		CreatedAt:    currentTime,
		UpdatedAt:    currentTime,
	}

	if insertError := handler.UsersRepository.Create(queryContext, newSuperadmin); insertError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to create superadmin user"})
		return
	}

	jwtToken, tokenError := usersRepo.GenerateJWT(newSuperadmin.ID.Hex(), newSuperadmin.Email, newSuperadmin.Role)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Superadmin created, but failed to generate authentication token"})
		return
	}

	log.Printf("[Setup] Superadmin successfully initialized: %s (%s)", newSuperadmin.Name, newSuperadmin.Email)

	writeJSONResponse(responseWriter, http.StatusCreated, SetupAdminResponse{
		Token:   jwtToken,
		User:    newSuperadmin,
		Message: "PocketRun superadmin successfully configured",
	})
}

