package kvusage

import "time"

const (
	Retention = 400 * 24 * time.Hour
)

type Operation string

const (
	OperationList          Operation = "get-all"
	OperationCount         Operation = "count"
	OperationEval          Operation = "eval"
	OperationGet           Operation = "get"
	OperationCreate        Operation = "create"
	OperationUpdate        Operation = "update"
	OperationReplace       Operation = "replace"
	OperationDelete        Operation = "delete"
	OperationClear         Operation = "delete-all"
	OperationExport        Operation = "export"
	OperationImport        Operation = "import"
	OperationProjectExport Operation = "project-export"
	OperationProjectImport Operation = "project-import"
	OperationProjectDelete Operation = "project-delete-all"
)

type Request struct {
	Operation  Operation
	Collection string
	IsFailed   bool
}
