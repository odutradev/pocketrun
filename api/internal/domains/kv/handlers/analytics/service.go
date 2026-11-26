package analytics

import (
	"context"
	"fmt"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	applicationrepository "pocketrun-api/internal/repositories/application"
	kvusagerepository "pocketrun-api/internal/repositories/kvusage"
	"pocketrun-api/internal/services/traffic"
)

type UsageRepository interface {
	Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]kvusagerepository.Hour, error)
	ForApplication(ctx context.Context, applicationID bson.ObjectID, from, to time.Time) ([]kvusagerepository.Hour, error)
}

type ApplicationFinder interface {
	List(ctx context.Context, managerID bson.ObjectID) ([]applicationrepository.Application, error)
	GetByID(ctx context.Context, managerID, id bson.ObjectID) (*applicationrepository.Application, error)
}

type usageFinder func(ctx context.Context, from, to time.Time) ([]kvusagerepository.Hour, error)

type Service struct {
	usage        UsageRepository
	applications ApplicationFinder
}

func NewService(usage UsageRepository, applications ApplicationFinder) *Service {
	return &Service{usage: usage, applications: applications}
}

func (s *Service) Application(ctx context.Context, managerID, id bson.ObjectID, query traffic.AnalyticsQuery) (Analytics, error) {
	application, err := s.applications.GetByID(ctx, managerID, id)
	if err != nil {
		return Analytics{}, fmt.Errorf("kv analytics application %s: %w", id.Hex(), err)
	}

	to := time.Now()
	from := application.CreatedAt
	if span := query.Range.Duration(); span > 0 {
		from = to.Add(-span)
	}
	find := func(ctx context.Context, from, to time.Time) ([]kvusagerepository.Hour, error) {
		return s.usage.ForApplication(ctx, application.ID, from, to)
	}

	analytics, _, err := collect(ctx, query, from, to, find)
	if err != nil {
		return Analytics{}, fmt.Errorf("kv analytics application %s: %w", id.Hex(), err)
	}
	return analytics, nil
}

func (s *Service) Overview(ctx context.Context, managerID bson.ObjectID, query traffic.AnalyticsQuery) (Overview, error) {
	to := time.Now()
	from := to.Add(-kvusagerepository.Retention)
	if span := query.Range.Duration(); span > 0 {
		from = to.Add(-span)
	}
	find := func(ctx context.Context, from, to time.Time) ([]kvusagerepository.Hour, error) {
		return s.usage.Between(ctx, managerID, from, to)
	}

	analytics, hours, err := collect(ctx, query, from, to, find)
	if err != nil {
		return Overview{}, fmt.Errorf("kv analytics overview: %w", err)
	}
	applications, err := s.applications.List(ctx, managerID)
	if err != nil {
		return Overview{}, fmt.Errorf("kv analytics overview: %w", err)
	}
	return Overview{Analytics: analytics, TopApplications: rank(hours, applications)}, nil
}

func collect(ctx context.Context, query traffic.AnalyticsQuery, from, to time.Time, find usageFinder) (Analytics, []kvusagerepository.Hour, error) {
	hours, err := find(ctx, from, to)
	if err != nil {
		return Analytics{}, nil, err
	}

	span := query.Range.Duration()
	if span == 0 {
		from = earliest(hours, from, to.Add(-minimumAllSpan))
	}
	analytics := build(query, from, to, hours)
	if span == 0 {
		return analytics, hours, nil
	}

	previous, err := find(ctx, from.Add(-span), from)
	if err != nil {
		return Analytics{}, nil, err
	}
	requests, failed := sum(previous)
	analytics.Totals.PreviousRequests, analytics.Totals.PreviousFailed = &requests, &failed
	return analytics, hours, nil
}

func earliest(hours []kvusagerepository.Hour, from, fallback time.Time) time.Time {
	first := fallback
	if from.After(first) {
		first = from
	}
	if len(hours) > 0 && hours[0].Hour.Before(first) {
		first = hours[0].Hour
	}
	return first
}

func build(query traffic.AnalyticsQuery, from, to time.Time, hours []kvusagerepository.Hour) Analytics {
	location := query.Location
	bucket, slots := traffic.Slots(from, to, location)
	analytics := Analytics{
		Range:       query.Range,
		Bucket:      bucket,
		From:        from,
		To:          to,
		Series:      make([]Point, 0, len(slots)),
		Heatmap:     []HeatCell{},
		Operations:  []Share{},
		Collections: []Share{},
	}

	indexes := map[int64]int{}
	for index, slot := range slots {
		indexes[slot.UnixMilli()] = index
		analytics.Series = append(analytics.Series, Point{At: slot})
	}

	heat := map[[2]int]int64{}
	operations, collections := map[string]int64{}, map[string]int64{}
	applications := map[bson.ObjectID]struct{}{}
	for _, hour := range hours {
		if hour.Requests == 0 {
			continue
		}
		if index, ok := indexes[traffic.SlotOf(hour.Hour, bucket, location).UnixMilli()]; ok {
			analytics.Series[index].Requests += hour.Requests
			analytics.Series[index].Failed += hour.Failed
		}
		local := hour.Hour.In(location)
		heat[[2]int{int(local.Weekday()), local.Hour()}] += hour.Requests
		for name, count := range hour.Operations {
			operations[name] += count
		}
		for name, count := range hour.Collections {
			collections[name] += count
		}
		applications[hour.ApplicationID] = struct{}{}
		if at := hour.Hour; analytics.LastActiveAt == nil || at.After(*analytics.LastActiveAt) {
			analytics.LastActiveAt = &at
		}
	}

	for key, requests := range heat {
		analytics.Heatmap = append(analytics.Heatmap, HeatCell{Weekday: key[0], Hour: key[1], Requests: requests})
	}
	sort.Slice(analytics.Heatmap, func(i, j int) bool {
		if analytics.Heatmap[i].Weekday == analytics.Heatmap[j].Weekday {
			return analytics.Heatmap[i].Hour < analytics.Heatmap[j].Hour
		}
		return analytics.Heatmap[i].Weekday < analytics.Heatmap[j].Weekday
	})

	analytics.Totals.Requests, analytics.Totals.Failed = sum(hours)
	analytics.Totals.Applications = int64(len(applications))
	analytics.Totals.Collections = int64(len(collections))
	analytics.Operations = shares(operations)
	analytics.Collections = shares(collections)
	return analytics
}

func sum(hours []kvusagerepository.Hour) (requests, failed int64) {
	for _, hour := range hours {
		requests += hour.Requests
		failed += hour.Failed
	}
	return requests, failed
}

func shares(counts map[string]int64) []Share {
	list := make([]Share, 0, len(counts))
	for name, requests := range counts {
		list = append(list, Share{Name: name, Requests: requests})
	}
	sort.Slice(list, func(i, j int) bool {
		if list[i].Requests == list[j].Requests {
			return list[i].Name < list[j].Name
		}
		return list[i].Requests > list[j].Requests
	})
	if len(list) <= MaxShares {
		return list
	}

	rest := Share{Name: otherShare}
	for _, share := range list[MaxShares-1:] {
		rest.Requests += share.Requests
	}
	return append(list[:MaxShares-1], rest)
}

func rank(hours []kvusagerepository.Hour, applications []applicationrepository.Application) []RankedApplication {
	tallies := map[bson.ObjectID]*RankedApplication{}
	for _, hour := range hours {
		current, ok := tallies[hour.ApplicationID]
		if !ok {
			current = &RankedApplication{ID: hour.ApplicationID}
			tallies[hour.ApplicationID] = current
		}
		current.Requests += hour.Requests
		current.Failed += hour.Failed
	}

	ranked := []RankedApplication{}
	for _, application := range applications {
		current, ok := tallies[application.ID]
		if !ok || current.Requests == 0 {
			continue
		}
		current.Name = application.Name
		current.ProjectID = application.ProjectID
		current.IsPageApplication = application.PageID != nil
		ranked = append(ranked, *current)
	}
	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].Requests == ranked[j].Requests {
			return ranked[i].ID.Hex() < ranked[j].ID.Hex()
		}
		return ranked[i].Requests > ranked[j].Requests
	})
	if len(ranked) > MaxApplications {
		return ranked[:MaxApplications]
	}
	return ranked
}
