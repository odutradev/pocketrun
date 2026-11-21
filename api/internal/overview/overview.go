package overview

import (
	"time"

	"pocketrun-api/internal/platform/traffic"
)

const minimumAllSpan = 7 * 24 * time.Hour

type Point struct {
	At    time.Time `json:"at"`
	Pages int64     `json:"pages"`
	Links int64     `json:"links"`
	KV    int64     `json:"kv"`
}

type Totals struct {
	Pages         int64  `json:"pages"`
	Links         int64  `json:"links"`
	KV            int64  `json:"kv"`
	PreviousPages *int64 `json:"previousPages"`
	PreviousLinks *int64 `json:"previousLinks"`
	PreviousKV    *int64 `json:"previousKv"`
}

type Usage struct {
	Range  traffic.Range  `json:"range"`
	Bucket traffic.Bucket `json:"bucket"`
	From   time.Time      `json:"from"`
	To     time.Time      `json:"to"`
	Totals Totals         `json:"totals"`
	Series []Point        `json:"series"`
}
