package overview

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/kv"
	"pocketrun-api/internal/platform/traffic"
)

type MomentFinder interface {
	Moments(ctx context.Context, from, to time.Time) ([]time.Time, error)
}

type KVUsageFinder interface {
	Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]kv.UsageHour, error)
}

type Dependencies struct {
	Pages  MomentFinder
	Links  MomentFinder
	KV     KVUsageFinder
	PageKV MomentFinder
}

type Service struct {
	pages  MomentFinder
	links  MomentFinder
	kv     KVUsageFinder
	pageKV MomentFinder
}

type activity struct {
	pages  []time.Time
	links  []time.Time
	kv     []kv.UsageHour
	pageKV []time.Time
}

func NewService(dependencies Dependencies) *Service {
	return &Service{pages: dependencies.Pages, links: dependencies.Links, kv: dependencies.KV, pageKV: dependencies.PageKV}
}

func (s *Service) Usage(ctx context.Context, managerID bson.ObjectID, query traffic.AnalyticsQuery) (Usage, error) {
	to := time.Now()
	span := query.Range.Duration()
	from := to.Add(-traffic.Retention)
	if span > 0 {
		from = to.Add(-span)
	}

	current, err := s.collect(ctx, managerID, from, to)
	if err != nil {
		return Usage{}, err
	}
	if span == 0 {
		from = earliest(current, to.Add(-minimumAllSpan))
	}

	usage := build(query, from, to, current)
	if span > 0 {
		previous, err := s.collect(ctx, managerID, from.Add(-span), from)
		if err != nil {
			return Usage{}, err
		}
		pages, links, kvRequests := int64(len(previous.pages)), int64(len(previous.links)), sumRequests(previous.kv)+int64(len(previous.pageKV))
		usage.Totals.PreviousPages, usage.Totals.PreviousLinks, usage.Totals.PreviousKV = &pages, &links, &kvRequests
	}
	return usage, nil
}

func (s *Service) collect(ctx context.Context, managerID bson.ObjectID, from, to time.Time) (activity, error) {
	pages, err := s.pages.Moments(ctx, from, to)
	if err != nil {
		return activity{}, fmt.Errorf("overview usage pages: %w", err)
	}
	links, err := s.links.Moments(ctx, from, to)
	if err != nil {
		return activity{}, fmt.Errorf("overview usage links: %w", err)
	}
	hours, err := s.kv.Between(ctx, managerID, from, to)
	if err != nil {
		return activity{}, fmt.Errorf("overview usage kv: %w", err)
	}
	pageKV, err := s.pageKV.Moments(ctx, from, to)
	if err != nil {
		return activity{}, fmt.Errorf("overview usage page kv: %w", err)
	}
	return activity{pages: pages, links: links, kv: hours, pageKV: pageKV}, nil
}

func earliest(current activity, fallback time.Time) time.Time {
	first := fallback
	for _, moment := range current.pages {
		if moment.Before(first) {
			first = moment
		}
	}
	for _, moment := range current.links {
		if moment.Before(first) {
			first = moment
		}
	}
	for _, hour := range current.kv {
		if hour.Hour.Before(first) {
			first = hour.Hour
		}
	}
	for _, moment := range current.pageKV {
		if moment.Before(first) {
			first = moment
		}
	}
	return first
}

func build(query traffic.AnalyticsQuery, from, to time.Time, current activity) Usage {
	bucket, slots := traffic.Slots(from, to, query.Location)
	usage := Usage{Range: query.Range, Bucket: bucket, From: from, To: to, Series: make([]Point, 0, len(slots))}

	indexes := map[int64]int{}
	for index, slot := range slots {
		indexes[slot.UnixMilli()] = index
		usage.Series = append(usage.Series, Point{At: slot})
	}
	slotIndex := func(at time.Time) (int, bool) {
		index, ok := indexes[traffic.SlotOf(at, bucket, query.Location).UnixMilli()]
		return index, ok
	}

	for _, moment := range current.pages {
		if index, ok := slotIndex(moment); ok {
			usage.Series[index].Pages++
		}
	}
	for _, moment := range current.links {
		if index, ok := slotIndex(moment); ok {
			usage.Series[index].Links++
		}
	}
	for _, hour := range current.kv {
		if index, ok := slotIndex(hour.Hour); ok {
			usage.Series[index].KV += hour.Requests
		}
	}
	for _, moment := range current.pageKV {
		if index, ok := slotIndex(moment); ok {
			usage.Series[index].KV++
		}
	}

	usage.Totals.Pages = int64(len(current.pages))
	usage.Totals.Links = int64(len(current.links))
	usage.Totals.KV = sumRequests(current.kv) + int64(len(current.pageKV))
	return usage
}

func sumRequests(hours []kv.UsageHour) int64 {
	total := int64(0)
	for _, hour := range hours {
		total += hour.Requests
	}
	return total
}
