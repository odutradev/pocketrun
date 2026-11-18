package link

import (
	"errors"
	"net/url"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/activation"
)

type Mode = activation.Mode

type State = activation.State

const (
	ModeActive   = activation.ModeActive
	ModeInactive = activation.ModeInactive
	ModePeriod   = activation.ModePeriod
	ModeClicks   = activation.ModeClicks
)

const (
	StateActive    = activation.StateActive
	StateInactive  = activation.StateInactive
	StateScheduled = activation.StateScheduled
	StateExpired   = activation.StateExpired
	StateExhausted = activation.StateExhausted
)

var (
	ErrLinkNotFound    = errors.New("link not found")
	ErrLinkUnavailable = errors.New("link unavailable")
	ErrInvalidLinkID   = errors.New("invalid link id")
	ErrInvalidSchedule = activation.ErrInvalidSchedule
	ErrSelfRedirect    = errors.New("destination points to this shortener")
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

func (l Link) Rule() activation.Rule {
	return activation.Rule{Mode: l.Mode, StartsAt: l.StartsAt, EndsAt: l.EndsAt, MaxClicks: l.MaxClicks}
}

func (l Link) StateAt(now time.Time) State {
	return l.Rule().StateAt(l.Clicks, now)
}

type Input struct {
	Title     string     `json:"title" validate:"required,max=20"`
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

	rule := i.Rule()
	rule.Normalize()
	i.StartsAt, i.EndsAt, i.MaxClicks = rule.StartsAt, rule.EndsAt, rule.MaxClicks
}

func (i Input) Rule() activation.Rule {
	return activation.Rule{Mode: i.Mode, StartsAt: i.StartsAt, EndsAt: i.EndsAt, MaxClicks: i.MaxClicks}
}

func (i Input) CheckDestination(hosts []string) error {
	target, err := url.Parse(i.URL)
	if err != nil {
		return nil
	}

	destination := normalizeHost(target.Host, target.Scheme)
	for _, host := range hosts {
		if host != "" && normalizeHost(host, target.Scheme) == destination {
			return ErrSelfRedirect
		}
	}
	return nil
}

func normalizeHost(host, scheme string) string {
	host = strings.ToLower(strings.TrimSpace(host))
	switch scheme {
	case "https":
		return strings.TrimSuffix(host, ":443")
	case "http":
		return strings.TrimSuffix(host, ":80")
	default:
		return host
	}
}

func NormalizeSlug(value string) string {
	return strings.ToLower(strings.Trim(strings.TrimSpace(value), "/"))
}

func (i Input) CheckSchedule() error {
	return i.Rule().Check()
}

const (
	DefaultListLimit = 20
	UngroupedFilter  = "none"
)

type Sort string

const (
	SortRecent   Sort = "recent"
	SortClicks   Sort = "clicks"
	SortTitle    Sort = "title"
	SortExpiring Sort = "expiring"
)

type ListQuery struct {
	GroupID   *bson.ObjectID
	Ungrouped bool
	Search    string
	State     State
	Sort      Sort
	Page      int
	Limit     int
	Now       time.Time
}

type ListParams struct {
	GroupID string `json:"groupId" query:"groupId" validate:"omitempty,mongodb|eq=none"`
	Search  string `json:"search" query:"search" validate:"max=100"`
	State   string `json:"state" query:"state" validate:"omitempty,oneof=active inactive scheduled expired exhausted"`
	Sort    string `json:"sort" query:"sort" validate:"omitempty,oneof=recent clicks title expiring"`
	Page    int    `json:"page" query:"page" validate:"omitempty,min=1"`
	Limit   int    `json:"limit" query:"limit" validate:"omitempty,min=1,max=100"`
}

func (p ListParams) Query() ListQuery {
	query := ListQuery{
		Ungrouped: p.GroupID == UngroupedFilter,
		Search:    strings.TrimSpace(p.Search),
		State:     State(p.State),
		Sort:      SortRecent,
		Page:      max(p.Page, 1),
		Limit:     DefaultListLimit,
	}
	if p.Sort != "" {
		query.Sort = Sort(p.Sort)
	}
	if p.Limit > 0 {
		query.Limit = p.Limit
	}
	if groupID, err := bson.ObjectIDFromHex(p.GroupID); err == nil {
		query.GroupID = &groupID
	}
	return query
}

type ListPage struct {
	Data       []Link `json:"data"`
	Total      int64  `json:"total"`
	Page       int    `json:"page"`
	Limit      int    `json:"limit"`
	TotalPages int64  `json:"totalPages"`
}

func newListPage(links []Link, total int64, query ListQuery) ListPage {
	limit := int64(max(query.Limit, 1))
	return ListPage{
		Data:       links,
		Total:      total,
		Page:       query.Page,
		Limit:      query.Limit,
		TotalPages: (total + limit - 1) / limit,
	}
}

type GroupTotals struct {
	GroupID *bson.ObjectID `json:"groupId" bson:"_id"`
	Links   int64          `json:"links" bson:"links"`
	Clicks  int64          `json:"clicks" bson:"clicks"`
}

type Summary struct {
	Total     int64         `json:"total"`
	Ungrouped int64         `json:"ungrouped"`
	Groups    []GroupTotals `json:"groups"`
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
