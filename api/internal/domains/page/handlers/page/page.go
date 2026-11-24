package page

import (
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	pagerepository "pocketrun-api/internal/repositories/page"
	"pocketrun-api/internal/services/activation"
)

const (
	MaxHTMLBytes     = 512 * 1024
	MaxBodyBytes     = 4 * MaxHTMLBytes
	DefaultListLimit = 20
	UngroupedFilter  = "none"
)

var (
	ErrPageNotFound    = pagerepository.ErrNotFound
	ErrPageUnavailable = pagerepository.ErrUnavailable
	ErrInvalidPageID   = errors.New("invalid page id")
	ErrPageTooLarge    = errors.New("page html too large")
)

type Input struct {
	Title        string             `json:"title" validate:"required,max=20"`
	Slug         string             `json:"slug" validate:"max=64"`
	HTML         *string            `json:"html"`
	GroupID      string             `json:"groupId" validate:"omitempty,mongodb"`
	Mode         activation.Mode    `json:"mode" validate:"required,oneof=active inactive period clicks"`
	StartsAt     *time.Time         `json:"startsAt"`
	EndsAt       *time.Time         `json:"endsAt"`
	MaxClicks    *int64             `json:"maxClicks" validate:"omitempty,min=1"`
	CountBy      activation.CountBy `json:"countBy" validate:"omitempty,oneof=clicks visitors"`
	RestoredFrom *int               `json:"restoredFrom" validate:"omitempty,min=1"`
	Message      string             `json:"message" validate:"max=80"`
}

func (i *Input) Normalize() {
	i.Title = strings.TrimSpace(i.Title)
	i.Slug = strings.ToLower(strings.TrimSpace(i.Slug))
	i.GroupID = strings.TrimSpace(i.GroupID)
	i.Message = strings.Join(strings.Fields(i.Message), " ")

	rule := i.Rule()
	rule.Normalize()
	i.StartsAt, i.EndsAt, i.MaxClicks, i.CountBy = rule.StartsAt, rule.EndsAt, rule.MaxClicks, rule.CountBy
}

func (i Input) Rule() activation.Rule {
	return activation.Rule{Mode: i.Mode, StartsAt: i.StartsAt, EndsAt: i.EndsAt, MaxClicks: i.MaxClicks, CountBy: i.CountBy}
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

type ListParams struct {
	GroupID string `json:"groupId" query:"groupId" validate:"omitempty,mongodb|eq=none"`
	Search  string `json:"search" query:"search" validate:"max=100"`
	State   string `json:"state" query:"state" validate:"omitempty,oneof=active inactive scheduled expired exhausted"`
	Sort    string `json:"sort" query:"sort" validate:"omitempty,oneof=recent clicks title expiring"`
	Page    int    `json:"page" query:"page" validate:"omitempty,min=1"`
	Limit   int    `json:"limit" query:"limit" validate:"omitempty,min=1,max=100"`
}

func (p ListParams) Query() pagerepository.ListQuery {
	query := pagerepository.ListQuery{
		Ungrouped: p.GroupID == UngroupedFilter,
		Search:    strings.TrimSpace(p.Search),
		State:     activation.State(p.State),
		Sort:      pagerepository.SortRecent,
		Page:      max(p.Page, 1),
		Limit:     DefaultListLimit,
	}
	if p.Sort != "" {
		query.Sort = pagerepository.Sort(p.Sort)
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
	Data       []pagerepository.Page `json:"data"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int64                 `json:"totalPages"`
}

func newListPage(pages []pagerepository.Page, total int64, query pagerepository.ListQuery) ListPage {
	limit := int64(max(query.Limit, 1))
	return ListPage{
		Data:       pages,
		Total:      total,
		Page:       query.Page,
		Limit:      query.Limit,
		TotalPages: (total + limit - 1) / limit,
	}
}

type Summary struct {
	Total     int64                        `json:"total"`
	Ungrouped int64                        `json:"ungrouped"`
	Groups    []pagerepository.GroupTotals `json:"groups"`
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
