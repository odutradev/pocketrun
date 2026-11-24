package sessioncookie

import (
	"net/http"

	"pocketrun-api/internal/domains/user/utils/jwt"
)

const (
	SecureName        = "__Host-pocketrun_session"
	InsecureName      = "pocketrun_session"
	ClientHeader      = "X-Pocketrun-Client"
	clientHeaderValue = "panel"
)

type Cookie struct {
	name     string
	isSecure bool
}

func New(allowsHTTP bool) Cookie {
	if allowsHTTP {
		return Cookie{name: InsecureName}
	}
	return Cookie{name: SecureName, isSecure: true}
}

func (c Cookie) Name() string {
	return c.name
}

func (c Cookie) Set(w http.ResponseWriter, token string) {
	http.SetCookie(w, c.build(token, int(jwt.TTL.Seconds())))
}

func (c Cookie) Clear(w http.ResponseWriter) {
	http.SetCookie(w, c.build("", -1))
}

func (c Cookie) build(value string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     c.name,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   c.isSecure,
		SameSite: http.SameSiteStrictMode,
	}
}

func IsPanelRequest(r *http.Request) bool {
	return r.Header.Get(ClientHeader) == clientHeaderValue
}
