package traffic

import (
	"sort"
	"time"
)

const MaxShareEntries = 8

type Range string

const (
	RangeDay     Range = "24h"
	RangeWeek    Range = "7d"
	RangeMonth   Range = "30d"
	RangeQuarter Range = "90d"
	RangeAll     Range = "all"
)

type Bucket string

const (
	BucketHour Bucket = "hour"
	BucketDay  Bucket = "day"
	BucketWeek Bucket = "week"
)

type AnalyticsQuery struct {
	Range    Range
	Location *time.Location
}

type Point struct {
	At       time.Time `json:"at"`
	Clicks   int64     `json:"clicks"`
	Visitors int64     `json:"visitors"`
}

type HeatCell struct {
	Weekday int   `json:"weekday"`
	Hour    int   `json:"hour"`
	Clicks  int64 `json:"clicks"`
}

type Share struct {
	Name   string `json:"name"`
	Clicks int64  `json:"clicks"`
}

type Totals struct {
	Clicks           int64  `json:"clicks"`
	Visitors         int64  `json:"visitors"`
	Bots             int64  `json:"bots"`
	PreviousClicks   *int64 `json:"previousClicks"`
	PreviousVisitors *int64 `json:"previousVisitors"`
}

type Analytics struct {
	Range       Range      `json:"range"`
	Bucket      Bucket     `json:"bucket"`
	From        time.Time  `json:"from"`
	To          time.Time  `json:"to"`
	Totals      Totals     `json:"totals"`
	LastClickAt *time.Time `json:"lastClickAt"`
	Series      []Point    `json:"series"`
	Heatmap     []HeatCell `json:"heatmap"`
	Referrers   []Share    `json:"referrers"`
	Devices     []Share    `json:"devices"`
	Systems     []Share    `json:"systems"`
	Browsers    []Share    `json:"browsers"`
}

type AnalyticsParams struct {
	Range    string `json:"range" query:"range" validate:"omitempty,oneof=24h 7d 30d 90d all"`
	Timezone string `json:"tz" query:"tz" validate:"omitempty,timezone"`
}

func (p AnalyticsParams) Query() AnalyticsQuery {
	query := AnalyticsQuery{Range: RangeWeek, Location: time.UTC}
	if p.Range != "" {
		query.Range = Range(p.Range)
	}
	if location, err := time.LoadLocation(p.Timezone); err == nil && p.Timezone != "" {
		query.Location = location
	}
	return query
}

func (r Range) Duration() time.Duration {
	switch r {
	case RangeDay:
		return 24 * time.Hour
	case RangeWeek:
		return 7 * 24 * time.Hour
	case RangeMonth:
		return 30 * 24 * time.Hour
	case RangeQuarter:
		return 90 * 24 * time.Hour
	default:
		return 0
	}
}

func bucketFor(span time.Duration) Bucket {
	switch {
	case span <= 2*24*time.Hour:
		return BucketHour
	case span <= 60*24*time.Hour:
		return BucketDay
	default:
		return BucketWeek
	}
}

func truncate(at time.Time, bucket Bucket, location *time.Location) time.Time {
	local := at.In(location)
	switch bucket {
	case BucketHour:
		return time.Date(local.Year(), local.Month(), local.Day(), local.Hour(), 0, 0, 0, location)
	case BucketWeek:
		offset := (int(local.Weekday()) + 6) % 7
		return time.Date(local.Year(), local.Month(), local.Day()-offset, 0, 0, 0, 0, location)
	default:
		return time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, location)
	}
}

func advance(at time.Time, bucket Bucket, location *time.Location) time.Time {
	local := at.In(location)
	switch bucket {
	case BucketHour:
		return time.Date(local.Year(), local.Month(), local.Day(), local.Hour()+1, 0, 0, 0, location)
	case BucketWeek:
		return time.Date(local.Year(), local.Month(), local.Day()+7, 0, 0, 0, 0, location)
	default:
		return time.Date(local.Year(), local.Month(), local.Day()+1, 0, 0, 0, 0, location)
	}
}

type counter map[string]int64

func (c counter) shares(fallback string) []Share {
	shares := make([]Share, 0, len(c))
	for name, clicks := range c {
		if name == "" {
			name = fallback
		}
		shares = append(shares, Share{Name: name, Clicks: clicks})
	}
	sort.Slice(shares, func(i, j int) bool {
		if shares[i].Clicks == shares[j].Clicks {
			return shares[i].Name < shares[j].Name
		}
		return shares[i].Clicks > shares[j].Clicks
	})

	if len(shares) <= MaxShareEntries {
		return shares
	}
	rest := Share{Name: "Outros"}
	for _, share := range shares[MaxShareEntries-1:] {
		rest.Clicks += share.Clicks
	}
	return append(shares[:MaxShareEntries-1], rest)
}

func Summarize(hits []Hit) (clicks int64, visitors int64) {
	seen := map[string]struct{}{}
	for _, hit := range hits {
		if hit.IsBot {
			continue
		}
		clicks++
		seen[hit.Visitor] = struct{}{}
	}
	return clicks, int64(len(seen))
}

func Build(query AnalyticsQuery, from, to time.Time, hits []Hit) Analytics {
	location := query.Location
	bucket := bucketFor(to.Sub(from))
	analytics := Analytics{
		Range:     query.Range,
		Bucket:    bucket,
		From:      from,
		To:        to,
		Series:    []Point{},
		Heatmap:   []HeatCell{},
		Referrers: []Share{},
		Devices:   []Share{},
		Systems:   []Share{},
		Browsers:  []Share{},
	}

	indexes := map[int64]int{}
	for at := truncate(from, bucket, location); at.Before(to); at = advance(at, bucket, location) {
		indexes[at.UnixMilli()] = len(analytics.Series)
		analytics.Series = append(analytics.Series, Point{At: at})
	}

	bucketVisitors := make([]map[string]struct{}, len(analytics.Series))
	heat := map[[2]int]int64{}
	referrers, devices, systems, browsers := counter{}, counter{}, counter{}, counter{}

	for _, hit := range hits {
		if hit.IsBot {
			analytics.Totals.Bots++
			continue
		}

		if index, ok := indexes[truncate(hit.At, bucket, location).UnixMilli()]; ok {
			analytics.Series[index].Clicks++
			if bucketVisitors[index] == nil {
				bucketVisitors[index] = map[string]struct{}{}
			}
			bucketVisitors[index][hit.Visitor] = struct{}{}
		}

		local := hit.At.In(location)
		heat[[2]int{int(local.Weekday()), local.Hour()}]++
		referrers[hit.Referrer]++
		devices[string(hit.Device)]++
		systems[hit.System]++
		browsers[hit.Browser]++

		if analytics.LastClickAt == nil || hit.At.After(*analytics.LastClickAt) {
			at := hit.At
			analytics.LastClickAt = &at
		}
	}

	for index, visitors := range bucketVisitors {
		analytics.Series[index].Visitors = int64(len(visitors))
	}
	for key, clicks := range heat {
		analytics.Heatmap = append(analytics.Heatmap, HeatCell{Weekday: key[0], Hour: key[1], Clicks: clicks})
	}

	analytics.Totals.Clicks, analytics.Totals.Visitors = Summarize(hits)
	analytics.Referrers = referrers.shares("")
	analytics.Devices = devices.shares("")
	analytics.Systems = systems.shares("Outros")
	analytics.Browsers = browsers.shares("Outros")
	return analytics
}

func Slots(from, to time.Time, location *time.Location) (Bucket, []time.Time) {
	bucket := bucketFor(to.Sub(from))
	slots := []time.Time{}
	for at := truncate(from, bucket, location); at.Before(to); at = advance(at, bucket, location) {
		slots = append(slots, at)
	}
	return bucket, slots
}

func SlotOf(at time.Time, bucket Bucket, location *time.Location) time.Time {
	return truncate(at, bucket, location)
}
