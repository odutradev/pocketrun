package sessioncookie

import (
	"net/http"

	"pocketrun-api/internal/domains/user/utils/jwt"
)

const (
	Name              = "__Host-pocketrun_session"
	ClientHeader      = "X-Pocketrun-Client"
	clientHeaderValue = "panel"
)

func Set(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     Name,
		Value:    token,
		Path:     "/",
		MaxAge:   int(jwt.TTL.Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
}

func Clear(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     Name,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
}

func IsPanelRequest(r *http.Request) bool {
	return r.Header.Get(ClientHeader) == clientHeaderValue
}
