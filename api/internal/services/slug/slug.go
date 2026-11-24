package slug

import (
	"errors"
	"regexp"

	slugrepository "pocketrun-api/internal/repositories/slug"
)

const (
	MaxLength    = 64
	RandomLength = 8
)

const (
	ReasonInvalid  = "invalid"
	ReasonReserved = "reserved"
	ReasonTaken    = "taken"
)

var (
	ErrSlugTaken    = slugrepository.ErrTaken
	ErrInvalidSlug  = errors.New("invalid slug")
	ErrReservedSlug = errors.New("reserved slug")
	ErrSlugNotFound = slugrepository.ErrNotFound
)

var pattern = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)

type Availability struct {
	Slug        string `json:"slug"`
	IsAvailable bool   `json:"isAvailable"`
	Reason      string `json:"reason,omitempty"`
}

func CheckFormat(value string) error {
	if len(value) == 0 || len(value) > MaxLength || !pattern.MatchString(value) {
		return ErrInvalidSlug
	}
	return nil
}

func Validate(value string) error {
	if err := CheckFormat(value); err != nil {
		return err
	}
	if isReserved(value) {
		return ErrReservedSlug
	}
	return nil
}

func isReserved(value string) bool {
	switch value {
	case "admin", "api", "apps", "auth", "healthz", "kv", "links", "pages", "ping", "setup", "static", "validate":
		return true
	default:
		return false
	}
}
