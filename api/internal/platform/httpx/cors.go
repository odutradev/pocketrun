package httpx

import (
	"net/http"
	"slices"
	"strings"
)

const (
	AllowedMethods = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
	AllowedHeaders = "Content-Type, Authorization, controlAccess, X-Pocket-Token"
)

func CORS(allowedOrigins string) func(http.Handler) http.Handler {
	origins := strings.Split(allowedOrigins, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSuffix(strings.TrimSpace(origin), "/")
	}
	allowsAny := slices.Contains(origins, "*")

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := strings.TrimSuffix(r.Header.Get("Origin"), "/")
			if allowsAny {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
			if !allowsAny && slices.Contains(origins, origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Add("Vary", "Origin")
			}
			w.Header().Set("Access-Control-Allow-Methods", AllowedMethods)
			w.Header().Set("Access-Control-Allow-Headers", AllowedHeaders)

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
