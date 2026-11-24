package link

import (
	"pocketrun-api/internal/domains/link/history"
	"pocketrun-api/internal/utils"
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
	add("groupId", utils.HexOrNil(previous.GroupID), utils.HexOrNil(next.GroupID))
	add("mode", string(previous.Mode), string(next.Mode))
	add("startsAt", utils.TimeOrNil(previous.StartsAt), utils.TimeOrNil(next.StartsAt))
	add("endsAt", utils.TimeOrNil(previous.EndsAt), utils.TimeOrNil(next.EndsAt))
	add("maxClicks", utils.IntOrNil(previous.MaxClicks), utils.IntOrNil(next.MaxClicks))
	add("countBy", utils.StringOrNil(previous.CountBy), utils.StringOrNil(next.CountBy))
	return changes
}

func snapshot(link Link) []history.Change {
	return diff(Link{}, link)
}
