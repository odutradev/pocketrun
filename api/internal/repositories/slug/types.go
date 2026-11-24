package slug

import "errors"

type Kind string

const (
	KindLink Kind = "link"
	KindPage Kind = "page"
)

var (
	ErrTaken    = errors.New("slug already in use")
	ErrNotFound = errors.New("slug not found")
)
