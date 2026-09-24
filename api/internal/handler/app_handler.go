package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/application"
	"pocketrun-api/internal/middleware"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type AppHandler struct {
	DB *database.MongoDB
}

func NewAppHandler(db *database.MongoDB) *AppHandler {
	return &AppHandler{DB: db}
}

type CreateAppRequest struct {
	Name                    string   `json:"name"`
	ProjectID               string   `json:"project_id"`
	Description             string   `json:"description"`
	AllowedOrigins          []string `json:"allowed_origins"`
	AllowNonBrowserRequests bool     `json:"allow_non_browser_requests"`
}

type CreateAppResponse struct {
	Application application.Application `json:"application"`
	RawToken    string                  `json:"raw_token"`
}

type CreateTokenRequest struct {
	Name         string `json:"name"`
	ValidityDays int    `json:"validity_days"`
}

type CreateTokenResponse struct {
	Token    application.Token `json:"token"`
	RawToken string            `json:"raw_token"`
}

func (h *AppHandler) ListApps(w http.ResponseWriter, r *http.Request) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, err := bson.ObjectIDFromHex(managerIDStr)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	cursor, err := h.DB.Database.Collection("applications").Find(ctx, bson.M{"manager_id": managerID})
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch applications"})
		return
	}
	defer cursor.Close(ctx)

	var apps []application.Application
	if err := cursor.All(ctx, &apps); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode applications"})
		return
	}

	if apps == nil {
		apps = []application.Application{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

func (h *AppHandler) CreateApp(w http.ResponseWriter, r *http.Request) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, err := bson.ObjectIDFromHex(managerIDStr)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	var req CreateAppRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.ProjectID = strings.ToLower(strings.TrimSpace(req.ProjectID))
	if req.Name == "" || req.ProjectID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Name and project_id are required"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Check unique project_id
	count, _ := h.DB.Database.Collection("applications").CountDocuments(ctx, bson.M{"project_id": req.ProjectID})
	if count > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "project_id is already in use"})
		return
	}

	if req.AllowedOrigins == nil {
		req.AllowedOrigins = []string{"*"}
	}

	rawToken, tokenStruct, err := application.GenerateAPIToken("Default Token", 365)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate initial token"})
		return
	}

	now := time.Now()
	newApp := application.Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerID,
		Name:                    req.Name,
		ProjectID:               req.ProjectID,
		Description:             req.Description,
		AllowedOrigins:          req.AllowedOrigins,
		AllowNonBrowserRequests: true,
		Tokens:                  []application.Token{tokenStruct},
		CreatedAt:               now,
		UpdatedAt:               now,
	}

	_, err = h.DB.Database.Collection("applications").InsertOne(ctx, newApp)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create application"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(CreateAppResponse{
		Application: newApp,
		RawToken:    rawToken,
	})
}

func (h *AppHandler) GetApp(w http.ResponseWriter, r *http.Request, appIDHex string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var app application.Application
	err = h.DB.Database.Collection("applications").FindOne(ctx, bson.M{"_id": appID, "manager_id": managerID}).Decode(&app)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(app)
}

func (h *AppHandler) UpdateApp(w http.ResponseWriter, r *http.Request, appIDHex string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	var req CreateAppRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":                        req.Name,
			"description":                 req.Description,
			"allowed_origins":             req.AllowedOrigins,
			"allow_non_browser_requests": req.AllowNonBrowserRequests,
			"updated_at":                  time.Now(),
		},
	}

	res, err := h.DB.Database.Collection("applications").UpdateOne(ctx, bson.M{"_id": appID, "manager_id": managerID}, update)
	if err != nil || res.MatchedCount == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application not found or update failed"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Application updated successfully"})
}

func (h *AppHandler) DeleteApp(w http.ResponseWriter, r *http.Request, appIDHex string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	res, err := h.DB.Database.Collection("applications").DeleteOne(ctx, bson.M{"_id": appID, "manager_id": managerID})
	if err != nil || res.DeletedCount == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application not found"})
		return
	}

	// Purge all KV documents for this app_id
	_, _ = h.DB.Database.Collection("kv_documents").DeleteMany(ctx, bson.M{"app_id": appID})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Application and all associated data deleted successfully"})
}

func (h *AppHandler) CreateToken(w http.ResponseWriter, r *http.Request, appIDHex string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	var req CreateTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	if req.Name == "" {
		req.Name = "New API Token"
	}

	rawToken, tokenStruct, err := application.GenerateAPIToken(req.Name, req.ValidityDays)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	res, err := h.DB.Database.Collection("applications").UpdateOne(
		ctx,
		bson.M{"_id": appID, "manager_id": managerID},
		bson.M{"$push": bson.M{"tokens": tokenStruct}},
	)

	if err != nil || res.MatchedCount == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(CreateTokenResponse{
		Token:    tokenStruct,
		RawToken: rawToken,
	})
}

func (h *AppHandler) DeleteToken(w http.ResponseWriter, r *http.Request, appIDHex, tokenID string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	res, err := h.DB.Database.Collection("applications").UpdateOne(
		ctx,
		bson.M{"_id": appID, "manager_id": managerID},
		bson.M{"$pull": bson.M{"tokens": bson.M{"id": tokenID}}},
	)

	if err != nil || res.MatchedCount == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application or token not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Token revoked successfully"})
}

// Data Explorer Endpoints for Manager Dashboard

func (h *AppHandler) GetExplorerCollections(w http.ResponseWriter, r *http.Request, appIDHex string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Ensure application belongs to manager
	count, _ := h.DB.Database.Collection("applications").CountDocuments(ctx, bson.M{"_id": appID, "manager_id": managerID})
	if count == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application not found"})
		return
	}

	var cols []string
	res := h.DB.Database.Collection("kv_documents").Distinct(ctx, "collection_name", bson.M{"app_id": appID})
	if err := res.Decode(&cols); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch collections"})
		return
	}

	if cols == nil {
		cols = []string{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cols)
}

func (h *AppHandler) GetExplorerDocuments(w http.ResponseWriter, r *http.Request, appIDHex, colName string) {
	managerIDStr := middleware.GetManagerID(r.Context())
	managerID, _ := bson.ObjectIDFromHex(managerIDStr)
	appID, err := bson.ObjectIDFromHex(appIDHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid app ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Verify manager ownership
	count, _ := h.DB.Database.Collection("applications").CountDocuments(ctx, bson.M{"_id": appID, "manager_id": managerID})
	if count == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Application not found"})
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 20
	}

	filter := bson.M{"app_id": appID, "collection_name": colName}
	total, _ := h.DB.Database.Collection("kv_documents").CountDocuments(ctx, filter)

	skip := int64((page - 1) * limit)
	opts := options.Find().SetSkip(skip).SetLimit(int64(limit)).SetSort(bson.M{"created_at": -1})

	cursor, err := h.DB.Database.Collection("kv_documents").Find(ctx, filter, opts)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to query documents"})
		return
	}
	defer cursor.Close(ctx)

	var docs []bson.M
	if err := cursor.All(ctx, &docs); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode documents"})
		return
	}

	if docs == nil {
		docs = []bson.M{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":       docs,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}
