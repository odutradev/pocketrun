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

const (
	EventAccessEnabled        EventType = "access_enabled"
	EventAccessDisabled       EventType = "access_disabled"
	EventAccessKeyCreated     EventType = "access_key_created"
	EventAccessKeyRenamed     EventType = "access_key_renamed"
	EventAccessPINReset       EventType = "access_pin_reset"
	EventAccessPINViewed      EventType = "access_pin_viewed"
	EventAccessKeyRemoved     EventType = "access_key_removed"
	EventAccessRevoked        EventType = "access_sessions_revoked"
	EventAccessSessionChanged EventType = "access_session_changed"
	EventAccessLocked         EventType = "access_locked"
	EventUnlocked             EventType = "unlocked"
	EventKVLinked             EventType = "kv_linked"
	EventKVChanged            EventType = "kv_changed"
	EventKVUnlinked           EventType = "kv_unlinked"
)

func NewService(repository historyservice.Repository, logger *slog.Logger) *Service {
	return historyservice.NewService(repository, "page", logger)
}

func NewEvent(pageID bson.ObjectID, eventType EventType, actor user.Actor, changes []Change, at time.Time) *Event {
	return historyservice.NewEvent(pageID, eventType, actor, changes, at)
}
