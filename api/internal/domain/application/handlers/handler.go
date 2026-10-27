package handlers

import (
	"encoding/json"
	"net/http"

	"pocketrun-api/internal/domain/application/repositories"
	kvRepositories "pocketrun-api/internal/domain/kv/repositories"
	"pocketrun-api/internal/domain/user"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type AppHandler struct {
	AppRepository *repositories.ApplicationRepository
	KVRepository  *kvRepositories.KVRepository
}

func NewAppHandler(
	appRepository *repositories.ApplicationRepository,
	kvRepository *kvRepositories.KVRepository,
) *AppHandler {
	return &AppHandler{
		AppRepository: appRepository,
		KVRepository:  kvRepository,
	}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func parseManagerAndApplicationIDs(request *http.Request, applicationIDHex string) (bson.ObjectID, bson.ObjectID, error) {
	managerIDString := user.GetManagerID(request.Context())
	managerObjectID, _ := bson.ObjectIDFromHex(managerIDString)
	applicationObjectID, parseError := bson.ObjectIDFromHex(applicationIDHex)
	return managerObjectID, applicationObjectID, parseError
}
