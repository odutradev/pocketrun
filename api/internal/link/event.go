package link

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const HistoryPageSize = 30

type EventType string

const (
	EventCreated       EventType = "created"
	EventUpdated       EventType = "updated"
	EventDeleted       EventType = "deleted"
	EventExpired       EventType = "expired"
	EventExhausted     EventType = "exhausted"
	EventGroupDetached EventType = "group_detached"
)

type Actor struct {
	ID    *bson.ObjectID `json:"id" bson:"id,omitempty"`
	Name  string         `json:"name" bson:"name"`
	Email string         `json:"email" bson:"email"`
}

type Change struct {
	Field string `json:"field" bson:"field"`
	From  any    `json:"from" bson:"from"`
	To    any    `json:"to" bson:"to"`
}

type Event struct {
	ID      bson.ObjectID `json:"id" bson:"_id"`
	LinkID  bson.ObjectID `json:"linkId" bson:"linkId"`
	Type    EventType     `json:"type" bson:"type"`
	Actor   Actor         `json:"actor" bson:"actor"`
	Changes []Change      `json:"changes" bson:"changes"`
	At      time.Time     `json:"at" bson:"at"`
}

type HistoryQuery struct {
	Before *time.Time
	Limit  int
}

type HistoryParams struct {
	Before string `json:"before" query:"before" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	Limit  int    `json:"limit" query:"limit" validate:"omitempty,min=1,max=100"`
}

func (p HistoryParams) Query() HistoryQuery {
	query := HistoryQuery{Limit: HistoryPageSize}
	if p.Limit > 0 {
		query.Limit = p.Limit
	}
	if before, err := time.Parse(time.RFC3339Nano, p.Before); err == nil {
		query.Before = &before
	}
	return query
}

type HistoryPage struct {
	Events     []Event    `json:"events"`
	NextCursor *time.Time `json:"nextCursor"`
	Total      int64      `json:"total"`
}

func systemActor() Actor {
	return Actor{Name: "Sistema"}
}

func newEvent(linkID bson.ObjectID, eventType EventType, actor Actor, changes []Change, at time.Time) *Event {
	if changes == nil {
		changes = []Change{}
	}
	return &Event{ID: bson.NewObjectID(), LinkID: linkID, Type: eventType, Actor: actor, Changes: changes, At: at}
}

func diff(previous, next Link) []Change {
	changes := []Change{}
	add := func(field string, from, to any) {
		if from != to {
			changes = append(changes, Change{Field: field, From: from, To: to})
		}
	}

	add("title", previous.Title, next.Title)
	add("slug", previous.Slug, next.Slug)
	add("url", previous.URL, next.URL)
	add("groupId", hexOrNil(previous.GroupID), hexOrNil(next.GroupID))
	add("mode", string(previous.Mode), string(next.Mode))
	add("startsAt", timeOrNil(previous.StartsAt), timeOrNil(next.StartsAt))
	add("endsAt", timeOrNil(previous.EndsAt), timeOrNil(next.EndsAt))
	add("maxClicks", intOrNil(previous.MaxClicks), intOrNil(next.MaxClicks))
	return changes
}

func snapshot(link Link) []Change {
	return diff(Link{}, link)
}

func hexOrNil(id *bson.ObjectID) any {
	if id == nil {
		return nil
	}
	return id.Hex()
}

func timeOrNil(value *time.Time) any {
	if value == nil {
		return nil
	}
	return value.UTC().Format(time.RFC3339)
}

func intOrNil(value *int64) any {
	if value == nil {
		return nil
	}
	return *value
}
