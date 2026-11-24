package user

import (
	loginattemptrepository "pocketrun-api/internal/repositories/loginattempt"
	userrepository "pocketrun-api/internal/repositories/user"
)

type (
	User          = userrepository.User
	Actor         = userrepository.Actor
	LoginAttempt  = loginattemptrepository.Attempt
	AttemptFilter = loginattemptrepository.Filter
)
