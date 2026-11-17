package link

import (
	"errors"
	"sort"
	"time"
)

const MaxShareEntries = 8

var ErrInvalidRange = errors.New("invalid analytics range")

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

func ParseRange(value string) (Range, error) {
	switch Range(value) {
	case "":
		return RangeWeek, nil
	case RangeDay, RangeWeek, RangeMonth, RangeQuarter, RangeAll:
		return Range(value), nil
	default:
		return "", ErrInvalidRange
	}
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

func summarize(opens []Open) (clicks int64, visitors int64) {
	seen := map[string]struct{}{}
	for _, open := range opens {
		if open.IsBot {
			continue
		}
		clicks++
		seen[open.Visitor] = struct{}{}
	}
	return clicks, int64(len(seen))
}

func buildAnalytics(query AnalyticsQuery, from, to time.Time, opens []Open) Analytics {
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

	for _, open := range opens {
		if open.IsBot {
			analytics.Totals.Bots++
			continue
		}

		if index, ok := indexes[truncate(open.At, bucket, location).UnixMilli()]; ok {
			analytics.Series[index].Clicks++
			if bucketVisitors[index] == nil {
				bucketVisitors[index] = map[string]struct{}{}
			}
			bucketVisitors[index][open.Visitor] = struct{}{}
		}

		local := open.At.In(location)
		heat[[2]int{int(local.Weekday()), local.Hour()}]++
		referrers[open.Referrer]++
		devices[string(open.Device)]++
		systems[open.System]++
		browsers[open.Browser]++

		if analytics.LastClickAt == nil || open.At.After(*analytics.LastClickAt) {
			at := open.At
			analytics.LastClickAt = &at
		}
	}

	for index, visitors := range bucketVisitors {
		analytics.Series[index].Visitors = int64(len(visitors))
	}
	for key, clicks := range heat {
		analytics.Heatmap = append(analytics.Heatmap, HeatCell{Weekday: key[0], Hour: key[1], Clicks: clicks})
	}

	analytics.Totals.Clicks, analytics.Totals.Visitors = summarize(opens)
	analytics.Referrers = referrers.shares("")
	analytics.Devices = devices.shares("")
	analytics.Systems = systems.shares("Outros")
	analytics.Browsers = browsers.shares("Outros")
	return analytics
}
