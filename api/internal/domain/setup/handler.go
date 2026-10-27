package setup

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"sync"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/user"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type SetupHandler struct {
	Database   *database.MongoDB
	setupMutex sync.Mutex
}

func NewSetupHandler(mongoDatabase *database.MongoDB) *SetupHandler {
	return &SetupHandler{
		Database: mongoDatabase,
	}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func CheckInitialStatus(mongoDatabase *database.MongoDB) {
	if mongoDatabase == nil || mongoDatabase.Database == nil {
		log.Println("[Setup] Warning: Database unavailable for initial status check")
		return
	}

	queryContext, cancelQuery := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := mongoDatabase.Database.Collection("users").CountDocuments(queryContext, bson.M{})
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

func (handler *SetupHandler) GetStatus(responseWriter http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodGet {
		http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if handler.Database == nil || handler.Database.Database == nil {
		writeJSONResponse(responseWriter, http.StatusServiceUnavailable, map[string]string{"error": "Database unavailable"})
		return
	}

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := handler.Database.Database.Collection("users").CountDocuments(queryContext, bson.M{})
	if countError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to check setup status"})
		return
	}

	writeJSONResponse(responseWriter, http.StatusOK, StatusResponse{
		SetupRequired: usersCount == 0,
		HasUsers:      usersCount > 0,
	})
}

func (handler *SetupHandler) SetupAdmin(responseWriter http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		http.Error(responseWriter, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if handler.Database == nil || handler.Database.Database == nil {
		writeJSONResponse(responseWriter, http.StatusServiceUnavailable, map[string]string{"error": "Database unavailable"})
		return
	}

	handler.setupMutex.Lock()
	defer handler.setupMutex.Unlock()

	queryContext, cancelQuery := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancelQuery()

	usersCount, countError := handler.Database.Database.Collection("users").CountDocuments(queryContext, bson.M{})
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

	if validationError := validateStrongPassword(setupPayload.Password); validationError != nil {
		writeJSONResponse(responseWriter, http.StatusBadRequest, map[string]string{"error": validationError.Error()})
		return
	}

	passwordHash, hashError := user.HashPassword(setupPayload.Password)
	if hashError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to securely hash password"})
		return
	}

	currentTime := time.Now()
	newSuperadmin := user.User{
		ID:           bson.NewObjectID(),
		Name:         setupPayload.Name,
		Email:        setupPayload.Email,
		Role:         "superadmin",
		PasswordHash: passwordHash,
		CreatedAt:    currentTime,
		UpdatedAt:    currentTime,
	}

	_, insertError := handler.Database.Database.Collection("users").InsertOne(queryContext, newSuperadmin)
	if insertError != nil {
		writeJSONResponse(responseWriter, http.StatusInternalServerError, map[string]string{"error": "Failed to create superadmin user"})
		return
	}

	jwtToken, tokenError := user.GenerateJWT(newSuperadmin.ID.Hex(), newSuperadmin.Email, newSuperadmin.Role)
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
