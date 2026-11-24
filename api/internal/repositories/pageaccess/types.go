package pageaccess

import "errors"

var (
	ErrConflict = errors.New("page access changed meanwhile")
	ErrNotFound = errors.New("page access not found")
)
