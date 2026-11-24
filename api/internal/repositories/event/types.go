package event

import "time"

type Type string

type Query struct {
	Before *time.Time
	Limit  int
}
