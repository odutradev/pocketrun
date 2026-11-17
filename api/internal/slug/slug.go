package slug

import (
	"errors"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	MaxLength    = 64
	RandomLength = 8
)

type Kind string

const (
	KindLink Kind = "link"
	KindPage Kind = "page"
)

const (
	ReasonInvalid  = "invalid"
	ReasonReserved = "reserved"
	ReasonTaken    = "taken"
)

var (
	ErrSlugTaken    = errors.New("slug already in use")
	ErrInvalidSlug  = errors.New("invalid slug")
	ErrReservedSlug = errors.New("reserved slug")
	ErrSlugNotFound = errors.New("slug not found")
)

var pattern = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)

var reserved = map[string]bool{
	"admin":    true,
	"api":      true,
	"apps":     true,
	"auth":     true,
	"healthz":  true,
	"kv":       true,
	"links":    true,
	"pages":    true,
	"ping":     true,
	"setup":    true,
	"static":   true,
	"validate": true,
}

type Entry struct {
	Slug      string        `bson:"_id"`
	Kind      Kind          `bson:"kind"`
	TargetID  bson.ObjectID `bson:"targetId"`
	CreatedAt time.Time     `bson:"createdAt"`
}

type Availability struct {
	Slug        string `json:"slug"`
	IsAvailable bool   `json:"isAvailable"`
	Reason      string `json:"reason,omitempty"`
}

func Validate(value string) error {
	if len(value) == 0 || len(value) > MaxLength || !pattern.MatchString(value) {
		return ErrInvalidSlug
	}
	if reserved[value] {
		return ErrReservedSlug
	}
	return nil
}
