package analytics

import (
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	openrepository "pocketrun-api/internal/repositories/open"
	"pocketrun-api/internal/services/traffic"
)

const MaxRanked = 8

type Open = openrepository.Open

type Target struct {
	ID        bson.ObjectID
	Title     string
	Slug      string
	CreatedAt time.Time
}

type Ranked struct {
	ID       bson.ObjectID `json:"id"`
	Title    string        `json:"title"`
	Slug     string        `json:"slug"`
	Clicks   int64         `json:"clicks"`
	Visitors int64         `json:"visitors"`
}

type tally struct {
	clicks   int64
	visitors map[string]struct{}
}

func newOpen(targetID bson.ObjectID, visit traffic.Visit, visitor string, at time.Time) *Open {
	return &Open{ID: bson.NewObjectID(), TargetID: targetID, Hit: traffic.NewHit(visit, visitor, at)}
}

func rank(opens []Open) []Ranked {
	tallies := map[bson.ObjectID]*tally{}
	for _, open := range opens {
		if open.IsBot {
			continue
		}
		current, ok := tallies[open.TargetID]
		if !ok {
			current = &tally{visitors: map[string]struct{}{}}
			tallies[open.TargetID] = current
		}
		current.clicks++
		current.visitors[open.Visitor] = struct{}{}
	}

	ranked := make([]Ranked, 0, len(tallies))
	for id, current := range tallies {
		ranked = append(ranked, Ranked{ID: id, Clicks: current.clicks, Visitors: int64(len(current.visitors))})
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
