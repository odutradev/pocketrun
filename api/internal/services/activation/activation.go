package activation

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Mode string

const (
	ModeActive   Mode = "active"
	ModeInactive Mode = "inactive"
	ModePeriod   Mode = "period"
	ModeClicks   Mode = "clicks"
)

type CountBy string

const (
	CountClicks   CountBy = "clicks"
	CountVisitors CountBy = "visitors"
)

type Counts struct {
	Clicks   int64
	Visitors int64
}

type State string

const (
	StateActive    State = "active"
	StateInactive  State = "inactive"
	StateScheduled State = "scheduled"
	StateExpired   State = "expired"
	StateExhausted State = "exhausted"
)

var ErrInvalidSchedule = errors.New("invalid schedule")

var FarFuture = time.Date(9999, time.December, 31, 0, 0, 0, 0, time.UTC)

type Rule struct {
	Mode      Mode
	StartsAt  *time.Time
	EndsAt    *time.Time
	MaxClicks *int64
	CountBy   CountBy
}

func (r *Rule) Normalize() {
	if r.Mode != ModePeriod {
		r.StartsAt = nil
		r.EndsAt = nil
	}
	if r.Mode != ModeClicks {
		r.MaxClicks = nil
		r.CountBy = ""
		return
	}
	if r.CountBy != CountVisitors {
		r.CountBy = CountClicks
	}
}

func (r Rule) CountsVisitors() bool {
	return r.Mode == ModeClicks && r.CountBy == CountVisitors
}

func (r Rule) counted(counts Counts) int64 {
	if r.CountBy == CountVisitors {
		return counts.Visitors
	}
	return counts.Clicks
}

func (r Rule) Check() error {
	switch r.Mode {
	case ModePeriod:
		if r.EndsAt == nil {
			return ErrInvalidSchedule
		}
		if r.StartsAt != nil && !r.StartsAt.Before(*r.EndsAt) {
			return ErrInvalidSchedule
		}
	case ModeClicks:
		if r.MaxClicks == nil {
			return ErrInvalidSchedule
		}
	}
	return nil
}

func (r Rule) StateAt(counts Counts, now time.Time) State {
	switch r.Mode {
	case ModeInactive:
		return StateInactive
	case ModePeriod:
		if r.StartsAt != nil && now.Before(*r.StartsAt) {
			return StateScheduled
		}
		if r.EndsAt != nil && !now.Before(*r.EndsAt) {
			return StateExpired
		}
		return StateActive
	case ModeClicks:
		if r.MaxClicks != nil && r.counted(counts) >= *r.MaxClicks {
			return StateExhausted
		}
		return StateActive
	default:
		return StateActive
	}
}

func (r Rule) ExhaustedBy(count int64) bool {
	return r.Mode == ModeClicks && r.MaxClicks != nil && count == *r.MaxClicks
}

func countedField() bson.M {
	return bson.M{"$cond": bson.A{
		bson.M{"$eq": bson.A{"$countBy", CountVisitors}},
		bson.M{"$ifNull": bson.A{"$uniqueVisitors", 0}},
		"$clicks",
	}}
}

func (r Rule) ExpiredBefore(now time.Time) bool {
	return r.Mode == ModePeriod && r.EndsAt != nil && !r.EndsAt.After(now)
}

func AvailableConditions(now time.Time) bson.A {
	return bson.A{
		bson.M{"mode": ModeActive},
		bson.M{
			"mode":   ModePeriod,
			"endsAt": bson.M{"$gt": now},
			"$or": bson.A{
				bson.M{"startsAt": bson.M{"$exists": false}},
				bson.M{"startsAt": bson.M{"$lte": now}},
			},
		},
		bson.M{
			"mode":  ModeClicks,
			"$expr": bson.M{"$lt": bson.A{countedField(), "$maxClicks"}},
		},
	}
}

func StateFilter(state State, now time.Time) bson.M {
	switch state {
	case StateInactive:
		return bson.M{"mode": ModeInactive}
	case StateScheduled:
		return bson.M{"mode": ModePeriod, "startsAt": bson.M{"$gt": now}}
	case StateExpired:
		return bson.M{"mode": ModePeriod, "endsAt": bson.M{"$lte": now}}
	case StateExhausted:
		return bson.M{"mode": ModeClicks, "$expr": bson.M{"$gte": bson.A{countedField(), "$maxClicks"}}}
	default:
		return bson.M{"$or": AvailableConditions(now)}
	}
}

func UpcomingExpiry(now time.Time) bson.D {
	return bson.D{{Key: "$cond", Value: bson.A{
		bson.D{{Key: "$gt", Value: bson.A{"$endsAt", now}}},
		"$endsAt",
		FarFuture,
	}}}
}
