package utils

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
	return remoteHost(r)
}

func OriginIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		first, _, _ := strings.Cut(forwarded, ",")
		return strings.TrimSpace(first)
	}
	if realIP := r.Header.Get("X-Real-Ip"); realIP != "" {
		return strings.TrimSpace(realIP)
	}
	return remoteHost(r)
}

func HasHost(r *http.Request, host string) bool {
	hosts := append([]string{r.Host}, strings.Split(r.Header.Get("X-Forwarded-Host"), ",")...)
	for _, candidate := range hosts {
		if strings.EqualFold(strings.TrimSpace(candidate), host) {
			return true
		}
	}
	return false
}

func remoteHost(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
