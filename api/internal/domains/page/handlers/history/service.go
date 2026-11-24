package history

import (
	"log/slog"

	historyservice "pocketrun-api/internal/services/history"
)

func NewService(repository historyservice.Repository, logger *slog.Logger) *historyservice.Service {
	return historyservice.NewService(repository, "page", logger)
}
