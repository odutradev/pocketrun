package application

import applicationrepository "pocketrun-api/internal/repositories/application"

type (
	Application = applicationrepository.Application
	Token       = applicationrepository.Token
	UpdateInput = applicationrepository.UpdateInput
	Operation   = applicationrepository.Operation
	Rule        = applicationrepository.Rule
	Role        = applicationrepository.Role
	Permission  = applicationrepository.Permission
)

const (
	AdminRole       = applicationrepository.AdminRole
	AnyCollection   = applicationrepository.AnyCollection
	OperationRead   = applicationrepository.OperationRead
	OperationCreate = applicationrepository.OperationCreate
	OperationUpdate = applicationrepository.OperationUpdate
	OperationDelete = applicationrepository.OperationDelete
	OperationManage = applicationrepository.OperationManage
)

var (
	ErrOperationForbidden = applicationrepository.ErrOperationForbidden
)
