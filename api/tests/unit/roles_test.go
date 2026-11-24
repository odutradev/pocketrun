package unit

import (
	"errors"
	"testing"

	"pocketrun-api/internal/domains/kv/utils/roles"
	applicationrepository "pocketrun-api/internal/repositories/application"
)

func TestApplicationAuthorize(t *testing.T) {
	read := applicationrepository.OperationRead
	create := applicationrepository.OperationCreate
	app := &applicationrepository.Application{Roles: []applicationrepository.Role{
		{
			Name: "caixa",
			Rules: []applicationrepository.Rule{
				{Collection: "produtos", Operations: []applicationrepository.Operation{read}},
				{Collection: "vendas", Operations: []applicationrepository.Operation{read, create}, MaxDocuments: 100},
			},
		},
		{
			Name:               "cliente",
			IsOwnDocumentsOnly: true,
			Rules: []applicationrepository.Rule{
				{Collection: "*", Operations: []applicationrepository.Operation{read, create}},
				{Collection: "segredos", Operations: []applicationrepository.Operation{applicationrepository.OperationDelete}},
			},
		},
	}}

	tests := []struct {
		name       string
		role       string
		collection string
		operation  applicationrepository.Operation
		want       applicationrepository.Permission
		wantErr    error
	}{
		{name: "admin can manage", role: applicationrepository.AdminRole, collection: "vendas", operation: applicationrepository.OperationManage, want: applicationrepository.Permission{Role: "admin", IsAdmin: true}},
		{name: "role can use allowed operation", role: "caixa", collection: "produtos", operation: read, want: applicationrepository.Permission{Role: "caixa"}},
		{name: "role carries collection limit", role: "caixa", collection: "vendas", operation: create, want: applicationrepository.Permission{Role: "caixa", MaxDocuments: 100}},
		{name: "role cannot use missing operation", role: "caixa", collection: "produtos", operation: applicationrepository.OperationDelete, wantErr: applicationrepository.ErrOperationForbidden},
		{name: "role cannot reach collection without rule", role: "caixa", collection: "clientes", operation: read, wantErr: applicationrepository.ErrOperationForbidden},
		{name: "custom role never manages", role: "caixa", collection: "vendas", operation: applicationrepository.OperationManage, wantErr: applicationrepository.ErrOperationForbidden},
		{name: "unknown role is forbidden", role: "fantasma", collection: "vendas", operation: read, wantErr: applicationrepository.ErrOperationForbidden},
		{name: "wildcard rule covers other collections", role: "cliente", collection: "pedidos", operation: create, want: applicationrepository.Permission{Role: "cliente", IsOwnDocumentsOnly: true}},
		{name: "named rule wins over wildcard", role: "cliente", collection: "segredos", operation: read, wantErr: applicationrepository.ErrOperationForbidden},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := app.Authorize(tt.role, tt.collection, tt.operation)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("Authorize() error = %v, want %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("Authorize() = %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestRolesCheckName(t *testing.T) {
	tests := []struct {
		name string
		role string
		want error
	}{
		{name: "rejects admin", role: "admin", want: roles.ErrReserved},
		{name: "rejects uppercase", role: "Caixa", want: roles.ErrInvalidName},
		{name: "rejects spaces", role: "meu cargo", want: roles.ErrInvalidName},
		{name: "rejects trailing dash", role: "caixa-", want: roles.ErrInvalidName},
		{name: "rejects long name", role: "a234567890123456789012345678901234567890x", want: roles.ErrInvalidName},
		{name: "accepts lowercase with dash", role: "caixa-loja-1"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := roles.CheckName(tt.role); !errors.Is(err, tt.want) {
				t.Errorf("CheckName(%q) = %v, want %v", tt.role, err, tt.want)
			}
		})
	}
}

func TestRolesCheckRules(t *testing.T) {
	read := []applicationrepository.Operation{applicationrepository.OperationRead}

	tests := []struct {
		name  string
		rules []applicationrepository.Rule
		want  error
	}{
		{name: "accepts named and wildcard rules", rules: []applicationrepository.Rule{{Collection: "vendas", Operations: read}, {Collection: "*", Operations: read}}},
		{name: "rejects duplicate collection", rules: []applicationrepository.Rule{{Collection: "vendas", Operations: read}, {Collection: "vendas", Operations: read}}, want: roles.ErrInvalidRule},
		{name: "rejects invalid collection name", rules: []applicationrepository.Rule{{Collection: "ven das", Operations: read}}, want: roles.ErrInvalidRule},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := roles.CheckRules(tt.rules); !errors.Is(err, tt.want) {
				t.Errorf("CheckRules() = %v, want %v", err, tt.want)
			}
		})
	}
}
