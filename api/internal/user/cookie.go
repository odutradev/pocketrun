package user

import "net/http"

const (
	SessionCookieName = "__Host-pocketrun_session"
	ClientHeader      = "X-Pocketrun-Client"
	clientHeaderValue = "panel"
)

func SetSessionCookie(w http.ResponseWriter, session *Session) {
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    session.Token,
		Path:     "/",
		MaxAge:   int(TokenTTL.Seconds()),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
}

func ClearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
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
