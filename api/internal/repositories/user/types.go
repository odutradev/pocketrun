package user

import "errors"

var (
	ErrNotFound   = errors.New("user not found")
	ErrEmailTaken = errors.New("email already in use")
)

const systemActorName = "Sistema"

func SystemActor() Actor {
	return Actor{Name: systemActorName}
}
