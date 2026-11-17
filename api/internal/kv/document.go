package kv

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	DefaultListLimit     = 50
	MaxListLimit         = 500
	DefaultExplorerLimit = 20
)

var (
	ErrDocumentNotFound  = errors.New("document not found")
	ErrInvalidDocumentID = errors.New("invalid document id")
)

type ExplorerParams struct {
	Page  int `json:"page" query:"page" validate:"omitempty,min=1"`
	Limit int `json:"limit" query:"limit" validate:"omitempty,min=1,max=100"`
}

func (p ExplorerParams) PageOrDefault() int {
	if p.Page == 0 {
		return 1
	}
	return p.Page
}

func (p ExplorerParams) LimitOrDefault() int {
	if p.Limit == 0 {
		return DefaultExplorerLimit
	}
	return p.Limit
}

type Document struct {
	ID             bson.ObjectID `json:"id" bson:"_id"`
	ApplicationID  bson.ObjectID `json:"appId" bson:"appId"`
	ProjectID      string        `json:"projectId" bson:"projectId"`
	CollectionName string        `json:"collectionName" bson:"collectionName"`
	Data           bson.M        `json:"data" bson:"data"`
	ExpiresAt      *time.Time    `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
	CreatedAt      time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt      time.Time     `json:"updatedAt" bson:"updatedAt"`
}

type CreateInput struct {
	Data          map[string]any `json:"data" validate:"required"`
	ExpiresInDays int            `json:"expiresInDays" validate:"min=0,max=3650"`
}

type UpdateInput struct {
	Data map[string]any `json:"data" validate:"required"`
}

type ListQuery struct {
	Filters  map[string]any
	Page     int
	Limit    int
	Paginate bool
}

type Page[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalPages int64 `json:"totalPages"`
}

func NewPage[T any](data []T, total int64, page, limit int) Page[T] {
	return Page[T]{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + int64(limit) - 1) / int64(limit),
	}
}

type DeleteResult struct {
	Message      string `json:"message"`
	DeletedCount int64  `json:"deletedCount"`
}
