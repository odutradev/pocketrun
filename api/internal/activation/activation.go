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
}

func (r *Rule) Normalize() {
	if r.Mode != ModePeriod {
		r.StartsAt = nil
		r.EndsAt = nil
	}
	if r.Mode != ModeClicks {
		r.MaxClicks = nil
	}
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

func (r Rule) StateAt(clicks int64, now time.Time) State {
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
		if r.MaxClicks != nil && clicks >= *r.MaxClicks {
			return StateExhausted
		}
		return StateActive
	default:
		return StateActive
	}
}

func (r Rule) ExhaustedBy(clicks int64) bool {
	return r.Mode == ModeClicks && r.MaxClicks != nil && clicks == *r.MaxClicks
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
			"$expr": bson.M{"$lt": bson.A{"$clicks", "$maxClicks"}},
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
		return bson.M{"mode": ModeClicks, "$expr": bson.M{"$gte": bson.A{"$clicks", "$maxClicks"}}}
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
