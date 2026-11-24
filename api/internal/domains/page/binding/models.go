package binding

import (
	pagebindingrepository "pocketrun-api/internal/repositories/pagebinding"
	pagekvrequestrepository "pocketrun-api/internal/repositories/pagekvrequest"
)

type (
	RoleMapping = pagebindingrepository.RoleMapping
	Binding     = pagebindingrepository.Binding
)

type (
	Action        = pagekvrequestrepository.Action
	LoggedRequest = pagekvrequestrepository.Request
)

const (
	RequestRetention = pagekvrequestrepository.Retention
	ActionList       = pagekvrequestrepository.ActionList
	ActionCount      = pagekvrequestrepository.ActionCount
	ActionEval       = pagekvrequestrepository.ActionEval
	ActionGet        = pagekvrequestrepository.ActionGet
	ActionCreate     = pagekvrequestrepository.ActionCreate
	ActionUpdate     = pagekvrequestrepository.ActionUpdate
	ActionReplace    = pagekvrequestrepository.ActionReplace
	ActionDelete     = pagekvrequestrepository.ActionDelete
)
