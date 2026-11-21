package link

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/link/history"
	"pocketrun-api/internal/platform/activation"
)

func diff(previous, next Link) []history.Change {
	changes := []history.Change{}
	add := func(field string, from, to any) {
		if from != to {
			changes = append(changes, history.Change{Field: field, From: from, To: to})
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
	add("countBy", countByOrNil(previous.CountBy), countByOrNil(next.CountBy))
	return changes
}

func snapshot(link Link) []history.Change {
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

func countByOrNil(value activation.CountBy) any {
	if value == "" {
		return nil
	}
	return string(value)
}
