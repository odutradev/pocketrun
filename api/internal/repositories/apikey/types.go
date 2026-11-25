package apikey

import "errors"

type Scope string

const (
	ScopeRead  Scope = "read"
	ScopeWrite Scope = "write"
	ScopeFull  Scope = "full"
)

const MaxKeysPerUser = 20

var ErrNotFound = errors.New("api key not found")

func (s Scope) Allows(required Scope) bool {
	return s.level() >= required.level()
}

func (s Scope) level() int {
	switch s {
	case ScopeRead:
		return 1
	case ScopeWrite:
		return 2
	case ScopeFull:
		return 3
	default:
		return 0
	}
}
