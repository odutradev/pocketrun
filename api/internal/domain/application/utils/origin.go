package utils

import (
	"strings"
)

func IsOriginAllowed(allowedOrigins []string, originHeader string, allowNonBrowserRequests bool) bool {
	trimmedOrigin := strings.TrimSpace(originHeader)

	if trimmedOrigin == "" {
		return allowNonBrowserRequests
	}

	trimmedOrigin = strings.TrimSuffix(trimmedOrigin, "/")

	for _, allowedOrigin := range allowedOrigins {
		allowedOrigin = strings.TrimSpace(allowedOrigin)
		if allowedOrigin == "*" {
			return true
		}
		normalizedAllowedOrigin := strings.TrimSuffix(allowedOrigin, "/")
		if strings.EqualFold(normalizedAllowedOrigin, trimmedOrigin) {
			return true
		}
	}

	return false
}

