package page

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/page/history"
	"pocketrun-api/internal/page/version"
)

func diff(previous, next Page) []history.Change {
	changes := []history.Change{}
	add := func(field string, from, to any) {
		if from != to {
			changes = append(changes, history.Change{Field: field, From: from, To: to})
		}
	}

	add("title", previous.Title, next.Title)
	add("slug", previous.Slug, next.Slug)
	add("version", versionOrNil(previous.Version), versionOrNil(next.Version))
	add("groupId", hexOrNil(previous.GroupID), hexOrNil(next.GroupID))
	add("mode", string(previous.Mode), string(next.Mode))
	add("startsAt", timeOrNil(previous.StartsAt), timeOrNil(next.StartsAt))
	add("endsAt", timeOrNil(previous.EndsAt), timeOrNil(next.EndsAt))
	add("maxClicks", intOrNil(previous.MaxClicks), intOrNil(next.MaxClicks))
	return changes
}

func snapshot(page Page) []history.Change {
	return diff(Page{}, page)
}

func versionOrNil(number int) any {
	if number == 0 {
		return nil
	}
	return version.Label(number)
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
