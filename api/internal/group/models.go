package group

import grouprepository "pocketrun-api/internal/repositories/group"

type (
	Kind  = grouprepository.Kind
	Group = grouprepository.Group
	Input = grouprepository.Input
)

const (
	KindLinks    = grouprepository.KindLinks
	KindPages    = grouprepository.KindPages
	DefaultColor = grouprepository.DefaultColor
	DefaultIcon  = grouprepository.DefaultIcon
)
