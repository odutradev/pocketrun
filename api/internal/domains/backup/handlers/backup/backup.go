package backup

import (
	"errors"
	"slices"
	"time"

	backuprepository "pocketrun-api/internal/repositories/backup"
)

const (
	Format          = "pocketrun-backup"
	FormatVersion   = 1
	MaxRestoreBytes = 2 << 30
	TransferTimeout = 30 * time.Minute
	insertBatchSize = 500
)

const (
	ScopeFull    = "full"
	ScopeContent = "content"
)

var (
	ErrInvalidFile       = errors.New("invalid backup file")
	errDuplicateDocument = backuprepository.ErrDuplicateDocument
	ErrUnsupportedFormat = errors.New("unsupported backup format")
	ErrTruncatedFile     = errors.New("truncated backup file")
	ErrMissingSuperadmin = errors.New("backup without superadmin")
	ErrRestoreRunning    = errors.New("restore already running")
)

var contentCollections = []string{
	"users",
	"applications",
	"kvDocuments",
	"groups",
	"slugs",
	"links",
	"pages",
	"pageVersions",
	"pageAccess",
	"pageBindings",
}

var historyCollections = []string{
	"linkEvents",
	"pageEvents",
	"linkOpens",
	"pageOpens",
	"kvUsage",
	"pageKvRequests",
	"uniqueVisitors",
}

type ExportQuery struct {
	Scope string `query:"scope" validate:"omitempty,oneof=full content"`
}

type Header struct {
	Format      string           `json:"format"`
	Version     int              `json:"version"`
	Scope       string           `json:"scope"`
	CreatedAt   time.Time        `json:"createdAt"`
	Collections []string         `json:"collections"`
	Documents   map[string]int64 `json:"documents"`
}

type Footer struct {
	End       bool             `json:"end"`
	Documents map[string]int64 `json:"documents"`
}

type CollectionSummary struct {
	Name      string `json:"name"`
	Group     string `json:"group"`
	Documents int64  `json:"documents"`
}

type Summary struct {
	Collections []CollectionSummary `json:"collections"`
}

type Result struct {
	Scope       string           `json:"scope"`
	CreatedAt   time.Time        `json:"createdAt"`
	RestoredAt  time.Time        `json:"restoredAt"`
	Documents   map[string]int64 `json:"documents"`
	Collections []string         `json:"collections"`
}

func collectionsFor(scope string) []string {
	if scope == ScopeContent {
		return slices.Clone(contentCollections)
	}
	return slices.Concat(contentCollections, historyCollections)
}

func isKnownCollection(name string) bool {
	return slices.Contains(contentCollections, name) || slices.Contains(historyCollections, name)
}

func groupOf(name string) string {
	if slices.Contains(historyCollections, name) {
		return "history"
	}
	return "content"
}
