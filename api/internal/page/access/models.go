package access

import (
	pageaccessrepository "pocketrun-api/internal/repositories/pageaccess"
	pageaccessattemptrepository "pocketrun-api/internal/repositories/pageaccessattempt"
)

type (
	Key    = pageaccessrepository.Key
	Access = pageaccessrepository.Access
)

type (
	Attempt = pageaccessattemptrepository.Attempt
)
