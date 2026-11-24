package document

import (
	"errors"
	"strings"
	"time"

	"pocketrun-api/internal/domains/kv/utils/kvquery"
	applicationrepository "pocketrun-api/internal/repositories/application"
	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
)

const (
	usageRecordWindow    = 5 * time.Second
	DefaultExplorerLimit = 20
	MaxExpiryDays        = 3650
	MaxImportItems       = 5000
	MaxImportBytes       = 8 << 20
	MaxDistinctValues    = 1000
)

var (
	ErrDocumentNotFound   = kvdocumentrepository.ErrNotFound
	ErrInvalidDocumentID  = errors.New("invalid document id")
	ErrInvalidCollection  = kvquery.ErrInvalidCollection
	ErrReservedCollection = kvquery.ErrReservedCollection
	ErrInvalidFilter      = kvquery.ErrInvalidFilter
	ErrInvalidSort        = kvquery.ErrInvalidSort
	ErrInvalidField       = kvquery.ErrInvalidField
	ErrInvalidFormat      = errors.New("invalid export format")
	ErrInvalidImport      = errors.New("invalid import item")
	ErrTooManyItems       = errors.New("too many import items")
	ErrCollectionFull     = errors.New("collection reached the document limit")
)

func NewScope(app *applicationrepository.Application, permission applicationrepository.Permission) kvdocumentrepository.Scope {
	return kvdocumentrepository.Scope{
		ApplicationID:      app.ID,
		ProjectID:          app.ProjectID,
		Role:               permission.Role,
		IsOwnDocumentsOnly: permission.IsOwnDocumentsOnly,
		MaxDocuments:       permission.MaxDocuments,
	}
}

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

type CreateInput struct {
	Data          map[string]any `json:"data" validate:"required"`
	ExpiresInDays int            `json:"expiresInDays" validate:"min=0,max=3650"`
	ExpiresAt     *time.Time     `json:"expiresAt"`
}

type UpdateInput struct {
	Data          map[string]any `json:"data" validate:"required"`
	ExpiresInDays *int           `json:"expiresInDays" validate:"omitempty,min=0,max=3650"`
	ExpiresAt     *time.Time     `json:"expiresAt"`
}

type EvalOperation string

const (
	EvalSum      EvalOperation = "sum"
	EvalAvg      EvalOperation = "avg"
	EvalCount    EvalOperation = "count"
	EvalMin      EvalOperation = "min"
	EvalMax      EvalOperation = "max"
	EvalDistinct EvalOperation = "distinct"
)

type EvalInput struct {
	Operation EvalOperation  `json:"operation" validate:"required,oneof=sum avg count min max distinct"`
	Field     string         `json:"field" validate:"required_unless=Operation count,max=200"`
	Filters   map[string]any `json:"filters"`
}

type EvalResult struct {
	Operation EvalOperation `json:"operation"`
	Field     string        `json:"field,omitempty"`
	Result    any           `json:"result"`
}

type DistinctValue struct {
	Value any   `json:"value" bson:"_id"`
	Count int64 `json:"count" bson:"count"`
}

type CountResult struct {
	Count int64 `json:"count"`
}

type ImportInput struct {
	Data []map[string]any `json:"data" validate:"required,max=5000"`
}

type ProjectImportInput struct {
	Data map[string][]map[string]any `json:"data" validate:"required"`
}

type ImportResult struct {
	Imported bool  `json:"imported"`
	Count    int64 `json:"count"`
}

type ProjectImportResult struct {
	Imported    bool             `json:"imported"`
	TotalCount  int64            `json:"totalCount"`
	Collections map[string]int64 `json:"collections"`
}

type ExportFormat string

const (
	ExportJSON ExportFormat = "json"
	ExportCSV  ExportFormat = "csv"
)

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

func ParseExportFormat(raw string) (ExportFormat, error) {
	switch ExportFormat(strings.ToLower(raw)) {
	case "", ExportJSON:
		return ExportJSON, nil
	case ExportCSV:
		return ExportCSV, nil
	}
	return "", ErrInvalidFormat
}
