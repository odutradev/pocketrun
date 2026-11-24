package version

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	pageversionrepository "pocketrun-api/internal/repositories/pageversion"
	"pocketrun-api/internal/user"
)

const MaxKept = 50

var (
	ErrVersionNotFound = pageversionrepository.ErrNotFound
	ErrInvalidVersion  = errors.New("invalid page version")
)

func Label(number int) string {
	return fmt.Sprintf("1.%d", max(number, 1)-1)
}

func ParseNumber(value string) (int, error) {
	number, err := strconv.Atoi(value)
	if err != nil || number < 1 {
		return 0, ErrInvalidVersion
	}
	return number, nil
}

func New(pageID bson.ObjectID, number int, html, message string, restoredFrom *int, actor user.Actor, at time.Time) *Version {
	return &Version{
		ID:           bson.NewObjectID(),
		PageID:       pageID,
		Number:       number,
		HTML:         html,
		Size:         int64(len(html)),
		RestoredFrom: restoredFrom,
		Message:      message,
		Actor:        actor,
		CreatedAt:    at,
	}
}

func withLabel(v *Version) *Version {
	v.Label = Label(v.Number)
	return v
}
