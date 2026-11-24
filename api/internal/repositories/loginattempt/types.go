package loginattempt

import "time"

const Retention = 24 * time.Hour

type Filter struct {
	Email  string
	Client string
	Since  time.Time
}
