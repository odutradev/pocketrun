package link

import (
	"errors"
	"strings"
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

var (
	ErrLinkNotFound    = errors.New("link not found")
	ErrLinkUnavailable = errors.New("link unavailable")
	ErrInvalidLinkID   = errors.New("invalid link id")
	ErrInvalidSchedule = errors.New("invalid schedule")
)

type Link struct {
	ID        bson.ObjectID  `json:"id" bson:"_id"`
	Title     string         `json:"title" bson:"title"`
	Slug      string         `json:"slug" bson:"slug"`
	URL       string         `json:"url" bson:"url"`
	GroupID   *bson.ObjectID `json:"groupId" bson:"groupId,omitempty"`
	Mode      Mode           `json:"mode" bson:"mode"`
	StartsAt  *time.Time     `json:"startsAt" bson:"startsAt,omitempty"`
	EndsAt    *time.Time     `json:"endsAt" bson:"endsAt,omitempty"`
	MaxClicks *int64         `json:"maxClicks" bson:"maxClicks,omitempty"`
	Clicks    int64          `json:"clicks" bson:"clicks"`
	State     State          `json:"state" bson:"-"`
	CreatedBy bson.ObjectID  `json:"createdBy" bson:"createdBy"`
	CreatedAt time.Time      `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt" bson:"updatedAt"`
}

func (l Link) StateAt(now time.Time) State {
	switch l.Mode {
	case ModeInactive:
		return StateInactive
	case ModePeriod:
		if l.StartsAt != nil && now.Before(*l.StartsAt) {
			return StateScheduled
		}
		if l.EndsAt != nil && !now.Before(*l.EndsAt) {
			return StateExpired
		}
		return StateActive
	case ModeClicks:
		if l.MaxClicks != nil && l.Clicks >= *l.MaxClicks {
			return StateExhausted
		}
		return StateActive
	default:
		return StateActive
	}
}

type Input struct {
	Title     string     `json:"title" validate:"required,max=120"`
	Slug      string     `json:"slug" validate:"max=64"`
	URL       string     `json:"url" validate:"required,http_url,max=2048"`
	GroupID   string     `json:"groupId" validate:"omitempty,mongodb"`
	Mode      Mode       `json:"mode" validate:"required,oneof=active inactive period clicks"`
	StartsAt  *time.Time `json:"startsAt"`
	EndsAt    *time.Time `json:"endsAt"`
	MaxClicks *int64     `json:"maxClicks" validate:"omitempty,min=1"`
}

func (i *Input) Normalize() {
	i.Title = strings.TrimSpace(i.Title)
	i.Slug = strings.ToLower(strings.TrimSpace(i.Slug))
	i.URL = strings.TrimSpace(i.URL)
	i.GroupID = strings.TrimSpace(i.GroupID)

	if i.Mode != ModePeriod {
		i.StartsAt = nil
		i.EndsAt = nil
	}
	if i.Mode != ModeClicks {
		i.MaxClicks = nil
	}
}

func (i Input) CheckSchedule() error {
	switch i.Mode {
	case ModePeriod:
		if i.EndsAt == nil {
			return ErrInvalidSchedule
		}
		if i.StartsAt != nil && !i.StartsAt.Before(*i.EndsAt) {
			return ErrInvalidSchedule
		}
	case ModeClicks:
		if i.MaxClicks == nil {
			return ErrInvalidSchedule
		}
	}
	return nil
}

type ListQuery struct {
	GroupID *bson.ObjectID
}

type ListParams struct {
	GroupID string `json:"groupId" query:"groupId" validate:"omitempty,mongodb"`
}

func (p ListParams) Query() ListQuery {
	groupID, err := bson.ObjectIDFromHex(p.GroupID)
	if err != nil {
		return ListQuery{}
	}
	return ListQuery{GroupID: &groupID}
}

type SlugCheckParams struct {
	Slug   string `json:"slug" query:"slug" validate:"max=64"`
	LinkID string `json:"linkId" query:"linkId" validate:"omitempty,mongodb"`
}

func (p SlugCheckParams) OwnerID() *bson.ObjectID {
	id, err := bson.ObjectIDFromHex(p.LinkID)
	if err != nil {
		return nil
	}
	return &id
}

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidLinkID
	}
	return id, nil
}
