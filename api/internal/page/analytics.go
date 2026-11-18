package page

import (
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/traffic"
)

const MaxRankedPages = 8

type Open struct {
	ID          bson.ObjectID `bson:"_id"`
	PageID      bson.ObjectID `bson:"pageId"`
	traffic.Hit `bson:",inline"`
}

func newOpen(pageID bson.ObjectID, visit traffic.Visit, visitor string, at time.Time) *Open {
	return &Open{ID: bson.NewObjectID(), PageID: pageID, Hit: traffic.NewHit(visit, visitor, at)}
}

type RankedPage struct {
	ID       bson.ObjectID `json:"id"`
	Title    string        `json:"title"`
	Slug     string        `json:"slug"`
	Clicks   int64         `json:"clicks"`
	Visitors int64         `json:"visitors"`
}

type Overview struct {
	traffic.Analytics
	TopPages []RankedPage `json:"topPages"`
}

type pageTally struct {
	clicks   int64
	visitors map[string]struct{}
}

func rankPages(opens []Open) []RankedPage {
	tallies := map[bson.ObjectID]*pageTally{}
	for _, open := range opens {
		if open.IsBot {
			continue
		}
		tally, ok := tallies[open.PageID]
		if !ok {
			tally = &pageTally{visitors: map[string]struct{}{}}
			tallies[open.PageID] = tally
		}
		tally.clicks++
		tally.visitors[open.Visitor] = struct{}{}
	}

	ranked := make([]RankedPage, 0, len(tallies))
	for id, tally := range tallies {
		ranked = append(ranked, RankedPage{ID: id, Clicks: tally.clicks, Visitors: int64(len(tally.visitors))})
	}
	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].Clicks == ranked[j].Clicks {
			return ranked[i].ID.Hex() < ranked[j].ID.Hex()
		}
		return ranked[i].Clicks > ranked[j].Clicks
	})
	if len(ranked) > MaxRankedPages {
		return ranked[:MaxRankedPages]
	}
	return ranked
}

func hitsOf(opens []Open) []traffic.Hit {
	hits := make([]traffic.Hit, 0, len(opens))
	for _, open := range opens {
		hits = append(hits, open.Hit)
	}
	return hits
}
