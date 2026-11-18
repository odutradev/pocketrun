package page

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/platform/activation"
)

const (
	MaxHTMLBytes     = 512 * 1024
	MaxBodyBytes     = 4 * MaxHTMLBytes
	DefaultListLimit = 20
	UngroupedFilter  = "none"
)

var (
	ErrPageNotFound    = errors.New("page not found")
	ErrPageUnavailable = errors.New("page unavailable")
	ErrInvalidPageID   = errors.New("invalid page id")
	ErrPageTooLarge    = errors.New("page html too large")
)

type Page struct {
	ID        bson.ObjectID    `json:"id" bson:"_id"`
	Title     string           `json:"title" bson:"title"`
	Slug      string           `json:"slug" bson:"slug"`
	HTML      string           `json:"html,omitempty" bson:"html,omitempty"`
	Size      int64            `json:"size" bson:"size"`
	Version   int              `json:"version" bson:"version"`
	GroupID   *bson.ObjectID   `json:"groupId" bson:"groupId,omitempty"`
	Mode      activation.Mode  `json:"mode" bson:"mode"`
	StartsAt  *time.Time       `json:"startsAt" bson:"startsAt,omitempty"`
	EndsAt    *time.Time       `json:"endsAt" bson:"endsAt,omitempty"`
	MaxClicks *int64           `json:"maxClicks" bson:"maxClicks,omitempty"`
	Clicks    int64            `json:"clicks" bson:"clicks"`
	State     activation.State `json:"state" bson:"-"`
	CreatedBy bson.ObjectID    `json:"createdBy" bson:"createdBy"`
	CreatedAt time.Time        `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt" bson:"updatedAt"`
}

func (p Page) Rule() activation.Rule {
	return activation.Rule{Mode: p.Mode, StartsAt: p.StartsAt, EndsAt: p.EndsAt, MaxClicks: p.MaxClicks}
}

func (p Page) StateAt(now time.Time) activation.State {
	return p.Rule().StateAt(p.Clicks, now)
}

type Input struct {
	Title        string          `json:"title" validate:"required,max=20"`
	Slug         string          `json:"slug" validate:"max=64"`
	HTML         *string         `json:"html"`
	GroupID      string          `json:"groupId" validate:"omitempty,mongodb"`
	Mode         activation.Mode `json:"mode" validate:"required,oneof=active inactive period clicks"`
	StartsAt     *time.Time      `json:"startsAt"`
	EndsAt       *time.Time      `json:"endsAt"`
	MaxClicks    *int64          `json:"maxClicks" validate:"omitempty,min=1"`
	RestoredFrom *int            `json:"restoredFrom" validate:"omitempty,min=1"`
	Message      string          `json:"message" validate:"max=80"`
}

func (i *Input) Normalize() {
	i.Title = strings.TrimSpace(i.Title)
	i.Slug = strings.ToLower(strings.TrimSpace(i.Slug))
	i.GroupID = strings.TrimSpace(i.GroupID)
	i.Message = strings.Join(strings.Fields(i.Message), " ")

	rule := i.Rule()
	rule.Normalize()
	i.StartsAt, i.EndsAt, i.MaxClicks = rule.StartsAt, rule.EndsAt, rule.MaxClicks
}

func (i Input) Rule() activation.Rule {
	return activation.Rule{Mode: i.Mode, StartsAt: i.StartsAt, EndsAt: i.EndsAt, MaxClicks: i.MaxClicks}
}

func (i Input) CheckHTML() error {
	if i.HTML != nil && len(*i.HTML) > MaxHTMLBytes {
		return ErrPageTooLarge
	}
	return nil
}

type StatusInput struct {
	IsActive *bool `json:"isActive" validate:"required"`
}

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
	State     activation.State
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
		State:     activation.State(p.State),
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
	Data       []Page `json:"data"`
	Total      int64  `json:"total"`
	Page       int    `json:"page"`
	Limit      int    `json:"limit"`
	TotalPages int64  `json:"totalPages"`
}

func newListPage(pages []Page, total int64, query ListQuery) ListPage {
	limit := int64(max(query.Limit, 1))
	return ListPage{
		Data:       pages,
		Total:      total,
		Page:       query.Page,
		Limit:      query.Limit,
		TotalPages: (total + limit - 1) / limit,
	}
}

type GroupTotals struct {
	GroupID *bson.ObjectID `json:"groupId" bson:"_id"`
	Pages   int64          `json:"pages" bson:"pages"`
	Clicks  int64          `json:"clicks" bson:"clicks"`
}

type Summary struct {
	Total     int64         `json:"total"`
	Ungrouped int64         `json:"ungrouped"`
	Groups    []GroupTotals `json:"groups"`
}

type SlugCheckParams struct {
	Slug   string `json:"slug" query:"slug" validate:"max=64"`
	PageID string `json:"pageId" query:"pageId" validate:"omitempty,mongodb"`
}

func (p SlugCheckParams) OwnerID() *bson.ObjectID {
	id, err := bson.ObjectIDFromHex(p.PageID)
	if err != nil {
		return nil
	}
	return &id
}

func ParseID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidPageID
	}
	return id, nil
}
