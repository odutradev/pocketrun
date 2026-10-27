package explorer

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ExplorerDocumentsResponse struct {
	Data       []bson.M `json:"data"`
	Total      int64    `json:"total"`
	Page       int      `json:"page"`
	Limit      int      `json:"limit"`
	TotalPages int64    `json:"total_pages"`
}

