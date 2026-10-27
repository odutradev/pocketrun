package utils

import (
	"context"
)

type ContextKey string

const (
	UserIDKey    ContextKey = "userID"
	UserEmailKey ContextKey = "userEmail"
)

func GetManagerID(requestContext context.Context) string {
	if managerID, exists := requestContext.Value(UserIDKey).(string); exists {
		return managerID
	}
	return ""
}

func GetManagerEmail(requestContext context.Context) string {
	if managerEmail, exists := requestContext.Value(UserEmailKey).(string); exists {
		return managerEmail
	}
	return ""
}
