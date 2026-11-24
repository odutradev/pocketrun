package utils

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func HexOrNil(id *bson.ObjectID) any {
	if id == nil {
		return nil
	}
	return id.Hex()
}

func TimeOrNil(value *time.Time) any {
	if value == nil {
		return nil
	}
	return value.UTC().Format(time.RFC3339)
}

func IntOrNil(value *int64) any {
	if value == nil {
		return nil
	}
	return *value
}

func StringOrNil[T ~string](value T) any {
	if value == "" {
		return nil
	}
	return string(value)
}
