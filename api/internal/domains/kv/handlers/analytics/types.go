package analytics

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	applicationrepository "pocketrun-api/internal/repositories/application"
	"pocketrun-api/internal/services/traffic"
)

const (
	MaxShares       = 8
	MaxApplications = 8
	minimumAllSpan  = 7 * 24 * time.Hour
	otherShare      = "Outros"
)

var ErrApplicationNotFound = applicationrepository.ErrNotFound

type Point struct {
	At       time.Time `json:"at"`
	Requests int64     `json:"requests"`
	Failed   int64     `json:"failed"`
}

type HeatCell struct {
	Weekday  int   `json:"weekday"`
	Hour     int   `json:"hour"`
	Requests int64 `json:"requests"`
}

type Share struct {
	Name     string `json:"name"`
	Requests int64  `json:"requests"`
}

type Totals struct {
	Requests         int64  `json:"requests"`
	Failed           int64  `json:"failed"`
	Applications     int64  `json:"applications"`
	Collections      int64  `json:"collections"`
	PreviousRequests *int64 `json:"previousRequests"`
	PreviousFailed   *int64 `json:"previousFailed"`
}

type Analytics struct {
	Range        traffic.Range  `json:"range"`
	Bucket       traffic.Bucket `json:"bucket"`
	From         time.Time      `json:"from"`
	To           time.Time      `json:"to"`
	Totals       Totals         `json:"totals"`
	LastActiveAt *time.Time     `json:"lastActiveAt"`
	Series       []Point        `json:"series"`
	Heatmap      []HeatCell     `json:"heatmap"`
	Operations   []Share        `json:"operations"`
	Collections  []Share        `json:"collections"`
}

type RankedApplication struct {
	ID                bson.ObjectID `json:"id"`
	Name              string        `json:"name"`
	ProjectID         string        `json:"projectId"`
	IsPageApplication bool          `json:"isPageApplication"`
	Requests          int64         `json:"requests"`
	Failed            int64         `json:"failed"`
}

type Overview struct {
	Analytics
	TopApplications []RankedApplication `json:"topApplications"`
}
