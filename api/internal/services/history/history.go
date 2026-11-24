package history

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	eventrepository "pocketrun-api/internal/repositories/event"
	userrepository "pocketrun-api/internal/repositories/user"
)

const PageSize = 30

type (
	EventType = eventrepository.Type
	Event     = eventrepository.Event
	Change    = eventrepository.Change
	Query     = eventrepository.Query
)

const (
	EventCreated       EventType = "created"
	EventUpdated       EventType = "updated"
	EventDeleted       EventType = "deleted"
	EventExpired       EventType = "expired"
	EventExhausted     EventType = "exhausted"
	EventGroupDetached EventType = "group_detached"
)

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

func NewEvent(targetID bson.ObjectID, eventType EventType, actor userrepository.Actor, changes []Change, at time.Time) *Event {
	if changes == nil {
		changes = []Change{}
	}
	return &Event{ID: bson.NewObjectID(), TargetID: targetID, Type: eventType, Actor: actor, Changes: changes, At: at}
}

func expirationEvent(targetID bson.ObjectID, expiredAt *time.Time, before *time.Time) *Event {
	if expiredAt == nil {
		return nil
	}
	if before != nil && !expiredAt.Before(*before) {
		return nil
	}

	event := NewEvent(targetID, EventExpired, userrepository.SystemActor(), nil, *expiredAt)
	event.ID = bson.NewObjectIDFromTimestamp(*expiredAt)
	return event
}
