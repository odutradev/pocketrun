package kv

import (
	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
	kvusagerepository "pocketrun-api/internal/repositories/kvusage"
)

type (
	Scope     = kvdocumentrepository.Scope
	Document  = kvdocumentrepository.Document
	ListQuery = kvdocumentrepository.ListQuery
)

type (
	UsageHour = kvusagerepository.Hour
)

const (
	UsageRetention = kvusagerepository.Retention
)
