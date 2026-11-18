package analytics

import (
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/traffic"
)

const MaxRanked = 8

type Open struct {
	ID          bson.ObjectID `bson:"_id"`
	LinkID      bson.ObjectID `bson:"linkId"`
	traffic.Hit `bson:",inline"`
}

func newOpen(linkID bson.ObjectID, visit traffic.Visit, visitor string, at time.Time) *Open {
	return &Open{ID: bson.NewObjectID(), LinkID: linkID, Hit: traffic.NewHit(visit, visitor, at)}
}

type Target struct {
	ID        bson.ObjectID
	Title     string
	Slug      string
	CreatedAt time.Time
}

type RankedLink struct {
	ID       bson.ObjectID `json:"id"`
	Title    string        `json:"title"`
	Slug     string        `json:"slug"`
	Clicks   int64         `json:"clicks"`
	Visitors int64         `json:"visitors"`
}

type Overview struct {
	traffic.Analytics
	TopLinks []RankedLink `json:"topLinks"`
}

type tally struct {
	clicks   int64
	visitors map[string]struct{}
}

func rank(opens []Open) []RankedLink {
	tallies := map[bson.ObjectID]*tally{}
	for _, open := range opens {
		if open.IsBot {
			continue
		}
		current, ok := tallies[open.LinkID]
		if !ok {
			current = &tally{visitors: map[string]struct{}{}}
			tallies[open.LinkID] = current
		}
		current.clicks++
		current.visitors[open.Visitor] = struct{}{}
	}

	ranked := make([]RankedLink, 0, len(tallies))
	for id, current := range tallies {
		ranked = append(ranked, RankedLink{ID: id, Clicks: current.clicks, Visitors: int64(len(current.visitors))})
	}
	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].Clicks == ranked[j].Clicks {
			return ranked[i].ID.Hex() < ranked[j].ID.Hex()
		}
		return ranked[i].Clicks > ranked[j].Clicks
	})
	if len(ranked) > MaxRanked {
		return ranked[:MaxRanked]
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
