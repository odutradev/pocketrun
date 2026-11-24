package page

import (
	"pocketrun-api/internal/page/history"
	"pocketrun-api/internal/page/version"
	"pocketrun-api/internal/utils"
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
	add("groupId", utils.HexOrNil(previous.GroupID), utils.HexOrNil(next.GroupID))
	add("mode", string(previous.Mode), string(next.Mode))
	add("startsAt", utils.TimeOrNil(previous.StartsAt), utils.TimeOrNil(next.StartsAt))
	add("endsAt", utils.TimeOrNil(previous.EndsAt), utils.TimeOrNil(next.EndsAt))
	add("maxClicks", utils.IntOrNil(previous.MaxClicks), utils.IntOrNil(next.MaxClicks))
	add("countBy", utils.StringOrNil(previous.CountBy), utils.StringOrNil(next.CountBy))
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
