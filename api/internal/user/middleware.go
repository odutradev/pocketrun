package user

import (
	"net/http"
	"strings"

	"pocketrun-api/internal/platform/httpx"
)

func Authenticate(signer *TokenSigner) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("Authorization")
			if authorization == "" {
				httpx.WriteError(w, http.StatusUnauthorized, "missing_authorization")
				return
			}

			scheme, token, found := strings.Cut(authorization, " ")
			if !found || !strings.EqualFold(scheme, "Bearer") {
				httpx.WriteError(w, http.StatusUnauthorized, "invalid_authorization")
				return
			}

			claims, err := signer.Verify(token)
			if err != nil {
				httpx.WriteError(w, http.StatusUnauthorized, "invalid_token")
				return
			}
			next.ServeHTTP(w, r.WithContext(WithClaims(r.Context(), claims)))
		})
	}
}
