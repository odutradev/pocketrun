package version

import (
	"errors"
	"strconv"

	pageversionrepository "pocketrun-api/internal/repositories/pageversion"
)

const MaxKept = 50

var (
	ErrVersionNotFound = pageversionrepository.ErrNotFound
	ErrInvalidVersion  = errors.New("invalid page version")
)

func ParseNumber(value string) (int, error) {
	number, err := strconv.Atoi(value)
	if err != nil || number < 1 {
		return 0, ErrInvalidVersion
	}
	return number, nil
}
