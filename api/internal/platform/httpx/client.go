package httpx

import (
	"net"
	"net/http"
	"strings"
)

func ClientIP(r *http.Request) string {
	hops := strings.Split(r.Header.Get("X-Forwarded-For"), ",")
	if last := strings.TrimSpace(hops[len(hops)-1]); last != "" {
		return last
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
