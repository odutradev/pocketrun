package history

import (
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	historyservice "pocketrun-api/internal/services/history"
	"pocketrun-api/internal/user"
)

const PageSize = historyservice.PageSize

type (
	EventType = historyservice.EventType
	Event     = historyservice.Event
	Change    = historyservice.Change
	Query     = historyservice.Query
	Params    = historyservice.Params
	Feed      = historyservice.Feed
	Service   = historyservice.Service
)

const (
	EventCreated       = historyservice.EventCreated
	EventUpdated       = historyservice.EventUpdated
	EventDeleted       = historyservice.EventDeleted
	EventExpired       = historyservice.EventExpired
	EventExhausted     = historyservice.EventExhausted
	EventGroupDetached = historyservice.EventGroupDetached
)

func NewService(repository historyservice.Repository, logger *slog.Logger) *Service {
	return historyservice.NewService(repository, "link", logger)
}

func NewEvent(linkID bson.ObjectID, eventType EventType, actor user.Actor, changes []Change, at time.Time) *Event {
	return historyservice.NewEvent(linkID, eventType, actor, changes, at)
}
