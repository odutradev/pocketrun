package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"pocketrun-api/internal/database"
	"pocketrun-api/internal/domain/kv"
	"pocketrun-api/internal/middleware"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type KVHandler struct {
	DB *database.MongoDB
}

func NewKVHandler(db *database.MongoDB) *KVHandler {
	return &KVHandler{DB: db}
}

func (h *KVHandler) ValidateControlAccess(w http.ResponseWriter, r *http.Request) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":     "valid",
		"message":    "Access token and origin are valid",
		"project_id": app.ProjectID,
		"app_name":   app.Name,
	})
}

func (h *KVHandler) Create(w http.ResponseWriter, r *http.Request, collectionName string) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	var req kv.CreateKVRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	if req.Data == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Field 'data' is required"})
		return
	}

	now := time.Now()
	var expiresAt *time.Time
	if req.ExpiresInDays > 0 {
		exp := now.AddDate(0, 0, req.ExpiresInDays)
		expiresAt = &exp
	}

	doc := kv.KVDocument{
		ID:             bson.NewObjectID(),
		AppID:          app.ID,
		ProjectID:      app.ProjectID,
		CollectionName: collectionName,
		Data:           req.Data,
		ExpiresAt:      expiresAt,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err := h.DB.Database.Collection("kv_documents").InsertOne(ctx, doc)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create document"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(doc)
}

func (h *KVHandler) GetAll(w http.ResponseWriter, r *http.Request, collectionName string) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Base filter by app_id and collection_name
	filter := bson.M{
		"app_id":          app.ID,
		"collection_name": collectionName,
	}

	// Dynamic filters from query params
	queryParams := r.URL.Query()
	for key, values := range queryParams {
		if key == "page" || key == "limit" || key == "pagination" {
			continue
		}
		if len(values) > 0 {
			val := values[0]
			// Try parsing boolean or numbers for strict types
			if boolVal, err := strconv.ParseBool(val); err == nil {
				filter["data."+key] = boolVal
			} else if floatVal, err := strconv.ParseFloat(val, 64); err == nil {
				filter["data."+key] = floatVal
			} else {
				filter["data."+key] = val
			}
		}
	}

	page, _ := strconv.Atoi(queryParams.Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(queryParams.Get("limit"))
	if limit < 1 || limit > 500 {
		limit = 50
	}

	usePagination := queryParams.Get("pagination") == "true" || queryParams.Get("page") != "" || queryParams.Get("limit") != ""

	opts := options.Find().SetSort(bson.M{"created_at": -1})
	if usePagination {
		skip := int64((page - 1) * limit)
		opts.SetSkip(skip).SetLimit(int64(limit))
	}

	total, _ := h.DB.Database.Collection("kv_documents").CountDocuments(ctx, filter)

	cursor, err := h.DB.Database.Collection("kv_documents").Find(ctx, filter, opts)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch documents"})
		return
	}
	defer cursor.Close(ctx)

	var docs []kv.KVDocument
	if err := cursor.All(ctx, &docs); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to decode documents"})
		return
	}

	if docs == nil {
		docs = []kv.KVDocument{}
	}

	w.Header().Set("Content-Type", "application/json")
	if usePagination {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"data":        docs,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		})
	} else {
		json.NewEncoder(w).Encode(docs)
	}
}

func (h *KVHandler) GetByID(w http.ResponseWriter, r *http.Request, collectionName, idHex string) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	docID, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid document ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var doc kv.KVDocument
	err = h.DB.Database.Collection("kv_documents").FindOne(ctx, bson.M{
		"_id":             docID,
		"app_id":          app.ID,
		"collection_name": collectionName,
	}).Decode(&doc)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Document not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(doc)
}

func (h *KVHandler) Update(w http.ResponseWriter, r *http.Request, collectionName, idHex string) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	docID, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid document ID"})
		return
	}

	var req kv.UpdateKVRequest
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
			"data":       req.Data,
			"updated_at": time.Now(),
		},
	}

	res, err := h.DB.Database.Collection("kv_documents").UpdateOne(ctx, bson.M{
		"_id":             docID,
		"app_id":          app.ID,
		"collection_name": collectionName,
	}, update)

	if err != nil || res.MatchedCount == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Document not found or update failed"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Document updated successfully"})
}

func (h *KVHandler) Delete(w http.ResponseWriter, r *http.Request, collectionName, idHex string) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	docID, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid document ID"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	res, err := h.DB.Database.Collection("kv_documents").DeleteOne(ctx, bson.M{
		"_id":             docID,
		"app_id":          app.ID,
		"collection_name": collectionName,
	})

	if err != nil || res.DeletedCount == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Document not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Document deleted successfully"})
}

func (h *KVHandler) DeleteAllCollection(w http.ResponseWriter, r *http.Request, collectionName string) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	res, err := h.DB.Database.Collection("kv_documents").DeleteMany(ctx, bson.M{
		"app_id":          app.ID,
		"collection_name": collectionName,
	})

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete collection"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Collection cleared successfully",
		"deleted_count": res.DeletedCount,
	})
}

func (h *KVHandler) DeleteAllProject(w http.ResponseWriter, r *http.Request) {
	app := middleware.GetAppFromContext(r.Context())
	if app == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	res, err := h.DB.Database.Collection("kv_documents").DeleteMany(ctx, bson.M{
		"app_id": app.ID,
	})

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete project data"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "All project data cleared successfully",
		"deleted_count": res.DeletedCount,
	})
}
