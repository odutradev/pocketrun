package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"

	"pocketrun-api/internal/domain/kv/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type KVHandler struct {
	Repository *repositories.KVRepository
}

func NewKVHandler(repository *repositories.KVRepository) *KVHandler {
	return &KVHandler{Repository: repository}
}

func writeJSONResponse(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	_ = json.NewEncoder(responseWriter).Encode(payload)
}

func buildCollectionQueryFilter(applicationID bson.ObjectID, collectionName string, queryParameters url.Values) bson.M {
	queryFilter := bson.M{
		"app_id":          applicationID,
		"collection_name": collectionName,
	}

	for parameterKey, parameterValues := range queryParameters {
		if parameterKey == "page" || parameterKey == "limit" || parameterKey == "pagination" {
			continue
		}
		if len(parameterValues) > 0 {
			rawValue := parameterValues[0]
			if booleanValue, parseBoolError := strconv.ParseBool(rawValue); parseBoolError == nil {
				queryFilter["data."+parameterKey] = booleanValue
			} else if numericValue, parseFloatError := strconv.ParseFloat(rawValue, 64); parseFloatError == nil {
				queryFilter["data."+parameterKey] = numericValue
			} else {
				queryFilter["data."+parameterKey] = rawValue
			}
		}
	}

	return queryFilter
}
