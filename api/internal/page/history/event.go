package history

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/user"
)

const PageSize = 30

type EventType string

const (
	EventCreated          EventType = "created"
	EventUpdated          EventType = "updated"
	EventDeleted          EventType = "deleted"
	EventExpired          EventType = "expired"
	EventExhausted        EventType = "exhausted"
	EventGroupDetached    EventType = "group_detached"
	EventAccessEnabled    EventType = "access_enabled"
	EventAccessDisabled   EventType = "access_disabled"
	EventAccessKeyCreated EventType = "access_key_created"
	EventAccessKeyRenamed EventType = "access_key_renamed"
	EventAccessPINReset   EventType = "access_pin_reset"
	EventAccessKeyRemoved EventType = "access_key_removed"
	EventAccessRevoked    EventType = "access_sessions_revoked"
	EventAccessLocked     EventType = "access_locked"
	EventUnlocked         EventType = "unlocked"
)

type Change struct {
	Field string `json:"field" bson:"field"`
	From  any    `json:"from" bson:"from"`
	To    any    `json:"to" bson:"to"`
}

type Event struct {
	ID      bson.ObjectID `json:"id" bson:"_id"`
	PageID  bson.ObjectID `json:"pageId" bson:"pageId"`
	Type    EventType     `json:"type" bson:"type"`
	Actor   user.Actor    `json:"actor" bson:"actor"`
	Changes []Change      `json:"changes" bson:"changes"`
	At      time.Time     `json:"at" bson:"at"`
}

type Query struct {
	Before *time.Time
	Limit  int
}

type Params struct {
	Before string `json:"before" query:"before" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	Limit  int    `json:"limit" query:"limit" validate:"omitempty,min=1,max=100"`
}

func (p Params) Query() Query {
	query := Query{Limit: PageSize}
	if p.Limit > 0 {
		query.Limit = p.Limit
	}
	if before, err := time.Parse(time.RFC3339Nano, p.Before); err == nil {
		query.Before = &before
	}
	return query
}

type Feed struct {
	Events     []Event    `json:"events"`
	NextCursor *time.Time `json:"nextCursor"`
	Total      int64      `json:"total"`
}

func NewEvent(pageID bson.ObjectID, eventType EventType, actor user.Actor, changes []Change, at time.Time) *Event {
	if changes == nil {
		changes = []Change{}
	}
	return &Event{ID: bson.NewObjectID(), PageID: pageID, Type: eventType, Actor: actor, Changes: changes, At: at}
}

func expirationEvent(pageID bson.ObjectID, expiredAt *time.Time, before *time.Time) *Event {
	if expiredAt == nil {
		return nil
	}
	if before != nil && !expiredAt.Before(*before) {
		return nil
	}

	event := NewEvent(pageID, EventExpired, user.SystemActor(), nil, *expiredAt)
	event.ID = bson.NewObjectIDFromTimestamp(*expiredAt)
	return event
}
