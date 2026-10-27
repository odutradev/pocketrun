package utils

import (
	"context"
	"net/http"

	appsRepo "pocketrun-api/internal/domain/application/repositories/apps"
	userUtils "pocketrun-api/internal/domain/user/utils"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ContextKey string

const (
	AppKey       ContextKey = "appKey"
	ProjectIDKey ContextKey = "projectIDKey"
)

func GetAppFromContext(requestContext context.Context) *appsRepo.Application {
	if applicationInstance, exists := requestContext.Value(AppKey).(*appsRepo.Application); exists {
		return applicationInstance
	}
	return nil
}

func GetProjectIDFromContext(requestContext context.Context) string {
	if projectID, exists := requestContext.Value(ProjectIDKey).(string); exists {
		return projectID
	}
	return ""
}

func ParseManagerAndApplicationIDs(request *http.Request, applicationIDHex string) (bson.ObjectID, bson.ObjectID, error) {
	managerIDString := userUtils.GetManagerID(request.Context())
	managerObjectID, _ := bson.ObjectIDFromHex(managerIDString)
	applicationObjectID, parseError := bson.ObjectIDFromHex(applicationIDHex)
	return managerObjectID, applicationObjectID, parseError
}

