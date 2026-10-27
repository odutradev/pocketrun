package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	usersRepo "pocketrun-api/internal/domain/user/repositories/users"

	"go.mongodb.org/mongo-driver/v2/bson"
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

func (handler *Handler) Register(responseWriter http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var registerPayload RegisterRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&registerPayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
		return
	}

	registerPayload.Email = strings.ToLower(strings.TrimSpace(registerPayload.Email))
	registerPayload.Name = strings.TrimSpace(registerPayload.Name)

	if registerPayload.Email == "" || registerPayload.Password == "" || registerPayload.Name == "" {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Name, email, and password are required"})
		return
	}

	if len(registerPayload.Password) < 6 {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Password must be at least 6 characters long"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	totalUsers, countError := handler.UsersRepository.CountUsers(queryContext)
	if countError == nil && totalUsers > 0 {
		writeJSONResponse(responseWriter, http.StatusForbidden, map[string]string{"error": "Public registration is disabled. Please contact your administrator."})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, map[string]string{"error": "Initial setup required. Please use the initial setup wizard."})
}

func (handler *Handler) Login(responseWriter http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginPayload LoginRequest
	if decodeError := json.NewDecoder(request.Body).Decode(&loginPayload); decodeError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
		return
	}

	loginPayload.Email = strings.ToLower(strings.TrimSpace(loginPayload.Email))
	if loginPayload.Email == "" || loginPayload.Password == "" {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Email and password are required"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	foundUser, findError := handler.UsersRepository.FindByEmail(queryContext, loginPayload.Email)
	if findError != nil || !usersRepo.CheckPassword(loginPayload.Password, foundUser.PasswordHash) {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Invalid email or password"})
		return
	}

	userRole := foundUser.Role
	if userRole == "" {
		userRole = "admin"
	}

	jwtToken, tokenError := usersRepo.GenerateJWT(foundUser.ID.Hex(), foundUser.Email, userRole)
	if tokenError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to generate authentication token"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, AuthResponse{
		Token: jwtToken,
		User:  *foundUser,
	})
}

func (handler *Handler) Me(responseWriter http.ResponseWriter, request *http.Request) {
	managerIDString := usersRepo.GetManagerID(request.Context())
	if managerIDString == "" {
		writeJSONResponse(responseWriter, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	managerObjectID, parseIDError := bson.ObjectIDFromHex(managerIDString)
	if parseIDError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	foundUser, findError := handler.UsersRepository.FindByID(queryContext, managerObjectID)
	if findError != nil {
		writeJSONResponse(responseWriter, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, foundUser)
}
