package analytics

import (
	analyticsservice "pocketrun-api/internal/services/analytics"
	"pocketrun-api/internal/services/traffic"
)

type Overview struct {
	traffic.Analytics
	TopPages []analyticsservice.Ranked `json:"topPages"`
}
