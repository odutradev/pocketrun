package history

import (
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	eventrepository "pocketrun-api/internal/repositories/event"
	userrepository "pocketrun-api/internal/repositories/user"
	historyservice "pocketrun-api/internal/services/history"
)

func NewService(repository historyservice.Repository, logger *slog.Logger) *historyservice.Service {
	return historyservice.NewService(repository, "link", logger)
}

func NewEvent(linkID bson.ObjectID, eventType eventrepository.Type, actor userrepository.Actor, changes []eventrepository.Change, at time.Time) *eventrepository.Event {
	return historyservice.NewEvent(linkID, eventType, actor, changes, at)
}
