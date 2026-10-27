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
	"unicode"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/user"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type SetupHandler struct {
	DB *database.MongoDB
	mu sync.Mutex
}

func NewSetupHandler(db *database.MongoDB) *SetupHandler {
	return &SetupHandler{
		DB: db,
	}
}

type StatusResponse struct {
	SetupRequired bool `json:"setup_required"`
	HasUsers      bool `json:"has_users"`
}

type SetupAdminRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SetupAdminResponse struct {
	Token   string    `json:"token"`
	User    user.User `json:"user"`
	Message string    `json:"message"`
}

func CheckInitialStatus(db *database.MongoDB) {
	if db == nil || db.Database == nil {
		log.Println("[Setup] Warning: Database unavailable for initial status check")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, err := db.Database.Collection("users").CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("[Setup] Warning: Could not verify users count: %v", err)
		return
	}

	if count == 0 {
		log.Println("==================================================================")
		log.Println("  [PocketRun] INITIAL SETUP REQUIRED (Dokploy-style onboarding)  ")
		log.Println("  No users found in database. Initial setup mode is ACTIVE.       ")
		log.Println("  Access the web console to configure the initial Superadmin.     ")
		log.Println("==================================================================")
		return
	}

	log.Printf("[Setup] Platform operational with %d registered manager(s).", count)
}

func (h *SetupHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if h.DB == nil || h.DB.Database == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Database unavailable"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	count, err := h.DB.Database.Collection("users").CountDocuments(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Failed to check setup status"})
		return
	}

	_ = json.NewEncoder(w).Encode(StatusResponse{
		SetupRequired: count == 0,
		HasUsers:      count > 0,
	})
}

func (h *SetupHandler) SetupAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if h.DB == nil || h.DB.Database == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Database unavailable"})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	count, err := h.DB.Database.Collection("users").CountDocuments(ctx, bson.M{})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Database error checking system status"})
		return
	}

	if count > 0 {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Initial setup has already been completed"})
		return
	}

	var req SetupAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	if req.Name == "" || req.Email == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "All fields (name, email, password) are required"})
		return
	}

	if len(req.Name) < 2 || len(req.Name) > 100 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Name must be between 2 and 100 characters"})
		return
	}

	if _, err := mail.ParseAddress(req.Email); err != nil || !strings.Contains(req.Email, ".") {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email address format"})
		return
	}

	if err := validateStrongPassword(req.Password); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	passwordHash, err := user.HashPassword(req.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Failed to securely hash password"})
		return
	}

	now := time.Now()
	newSuperadmin := user.User{
		ID:           bson.NewObjectID(),
		Name:         req.Name,
		Email:        req.Email,
		Role:         "superadmin",
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	_, err = h.DB.Database.Collection("users").InsertOne(ctx, newSuperadmin)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create superadmin user"})
		return
	}

	tokenStr, err := user.GenerateJWT(newSuperadmin.ID.Hex(), newSuperadmin.Email, newSuperadmin.Role)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Superadmin created, but failed to generate authentication token"})
		return
	}

	log.Printf("[Setup] Superadmin successfully initialized: %s (%s)", newSuperadmin.Name, newSuperadmin.Email)

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(SetupAdminResponse{
		Token:   tokenStr,
		User:    newSuperadmin,
		Message: "PocketRun superadmin successfully configured",
	})
}

func RegisterRoutes(mux *http.ServeMux, db *database.MongoDB) {
	h := NewSetupHandler(db)
	mux.HandleFunc("GET /api/v1/setup/status", h.GetStatus)
	mux.HandleFunc("POST /api/v1/setup/admin", h.SetupAdmin)
}

func validateStrongPassword(password string) error {
	if len(password) < 8 {
		return &validationError{"Password must be at least 8 characters long"}
	}
	if len(password) > 128 {
		return &validationError{"Password must not exceed 128 characters"}
	}

	var hasLetter, hasDigit bool
	for _, char := range password {
		if unicode.IsLetter(char) {
			hasLetter = true
		} else if unicode.IsDigit(char) || unicode.IsPunct(char) || unicode.IsSymbol(char) {
			hasDigit = true
		}
	}

	if !hasLetter || !hasDigit {
		return &validationError{"Password must contain at least one letter and at least one digit or symbol"}
	}

	return nil
}

type validationError struct {
	msg string
}

func (e *validationError) Error() string {
	return e.msg
}
