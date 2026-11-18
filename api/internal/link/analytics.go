package link

import (
	"sort"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/traffic"
)

const MaxRankedLinks = 8

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

type linkTally struct {
	clicks   int64
	visitors map[string]struct{}
}

func rankLinks(opens []Open) []RankedLink {
	tallies := map[bson.ObjectID]*linkTally{}
	for _, open := range opens {
		if open.IsBot {
			continue
		}
		tally, ok := tallies[open.LinkID]
		if !ok {
			tally = &linkTally{visitors: map[string]struct{}{}}
			tallies[open.LinkID] = tally
		}
		tally.clicks++
		tally.visitors[open.Visitor] = struct{}{}
	}

	ranked := make([]RankedLink, 0, len(tallies))
	for id, tally := range tallies {
		ranked = append(ranked, RankedLink{ID: id, Clicks: tally.clicks, Visitors: int64(len(tally.visitors))})
	}
	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].Clicks == ranked[j].Clicks {
			return ranked[i].ID.Hex() < ranked[j].ID.Hex()
		}
		return ranked[i].Clicks > ranked[j].Clicks
	})
	if len(ranked) > MaxRankedLinks {
		return ranked[:MaxRankedLinks]
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
