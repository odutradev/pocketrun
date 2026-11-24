package history

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	eventrepository "pocketrun-api/internal/repositories/event"
	userrepository "pocketrun-api/internal/repositories/user"
	historyservice "pocketrun-api/internal/services/history"
)

const (
	EventAccessEnabled        eventrepository.Type = "access_enabled"
	EventAccessDisabled       eventrepository.Type = "access_disabled"
	EventAccessKeyCreated     eventrepository.Type = "access_key_created"
	EventAccessKeyRenamed     eventrepository.Type = "access_key_renamed"
	EventAccessPINReset       eventrepository.Type = "access_pin_reset"
	EventAccessPINViewed      eventrepository.Type = "access_pin_viewed"
	EventAccessKeyRemoved     eventrepository.Type = "access_key_removed"
	EventAccessRevoked        eventrepository.Type = "access_sessions_revoked"
	EventAccessSessionChanged eventrepository.Type = "access_session_changed"
	EventAccessLocked         eventrepository.Type = "access_locked"
	EventUnlocked             eventrepository.Type = "unlocked"
	EventKVLinked             eventrepository.Type = "kv_linked"
	EventKVChanged            eventrepository.Type = "kv_changed"
	EventKVUnlinked           eventrepository.Type = "kv_unlinked"
)

func NewEvent(pageID bson.ObjectID, eventType eventrepository.Type, actor userrepository.Actor, changes []eventrepository.Change, at time.Time) *eventrepository.Event {
	return historyservice.NewEvent(pageID, eventType, actor, changes, at)
}
