package kv

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/database"
)

func RegisterRoutes(mux *http.ServeMux, db *database.MongoDB, appAuthMW func(http.Handler) http.Handler) {
	h := NewKVHandler(db)

	mux.Handle("/validate/control-access", appAuthMW(http.HandlerFunc(h.ValidateControlAccess)))

	mux.Handle("/kv/", appAuthMW(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/kv/")
		parts := strings.Split(path, "/")

		if path == "project/delete-all" && r.Method == http.MethodDelete {
			h.DeleteAllProject(w, r)
			return
		}

		if len(parts) < 2 {
			http.Error(w, "Invalid KV route pattern", http.StatusBadRequest)
			return
		}

		collectionName := parts[0]
		action := parts[1]

		switch action {
		case "create":
			if r.Method == http.MethodPost {
				h.Create(w, r, collectionName)
				return
			}
		case "get-all":
			if r.Method == http.MethodGet {
				h.GetAll(w, r, collectionName)
				return
			}
		case "get":
			if len(parts) == 3 && r.Method == http.MethodGet {
				h.GetByID(w, r, collectionName, parts[2])
				return
			}
		case "update":
			if len(parts) == 3 && r.Method == http.MethodPatch {
				h.Update(w, r, collectionName, parts[2])
				return
			}
		case "delete":
			if len(parts) == 3 && r.Method == http.MethodDelete {
				h.Delete(w, r, collectionName, parts[2])
				return
			}
		case "delete-all":
			if r.Method == http.MethodDelete {
				h.DeleteAllCollection(w, r, collectionName)
				return
			}
		}

		http.Error(w, "Endpoint not found or method not allowed", http.StatusNotFound)
	})))
}
