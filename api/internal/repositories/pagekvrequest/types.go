package pagekvrequest

import "time"

const (
	Retention = 30 * 24 * time.Hour
)

type Action string

const (
	ActionList    Action = "get-all"
	ActionCount   Action = "count"
	ActionEval    Action = "eval"
	ActionGet     Action = "get"
	ActionCreate  Action = "create"
	ActionUpdate  Action = "update"
	ActionReplace Action = "replace"
	ActionDelete  Action = "delete"
)
