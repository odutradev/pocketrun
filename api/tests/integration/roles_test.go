package integration

import (
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

func TestKVRoles(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	app := env.CreateApp("Loja")
	env.CreateRole(app, "caixa", false,
		testenv.Rule{Collection: "produtos", Operations: []string{"read"}},
		testenv.Rule{Collection: "vendas", Operations: []string{"read", "create"}, MaxDocuments: 2},
	)
	env.CreateRole(app, "cliente", true, testenv.Rule{Collection: "pedidos", Operations: []string{"read", "create", "update", "delete"}})
	env.CreateRole(app, "vendedor", true, testenv.Rule{Collection: "pedidos", Operations: []string{"read", "create"}})
	cashier := env.CreateToken(app, "caixa")
	customer := env.CreateToken(app, "cliente")
	seller := env.CreateToken(app, "vendedor")

	product := documentID(t, env.KV(app.Token, http.MethodPost, "/kv/produtos/create", document("nome", "café")))
	order := documentID(t, env.KV(seller, http.MethodPost, "/kv/pedidos/create", document("item", "café")))

	tests := []struct {
		name     string
		token    string
		method   string
		path     string
		body     any
		wantCode int
		wantErr  string
	}{
		{name: "allowed operation passes", token: cashier, method: http.MethodGet, path: "/kv/produtos/get/" + product, wantCode: http.StatusOK},
		{name: "missing operation is forbidden", token: cashier, method: http.MethodPost, path: "/kv/produtos/create", body: document("nome", "chá"), wantCode: http.StatusForbidden, wantErr: "forbidden_operation"},
		{name: "collection without rule is forbidden", token: cashier, method: http.MethodGet, path: "/kv/clientes/get-all", wantCode: http.StatusForbidden, wantErr: "forbidden_operation"},
		{name: "custom role cannot clear a collection", token: cashier, method: http.MethodDelete, path: "/kv/vendas/delete-all", wantCode: http.StatusForbidden, wantErr: "forbidden_operation"},
		{name: "custom role cannot export the project", token: cashier, method: http.MethodGet, path: "/kv/project/export", wantCode: http.StatusForbidden, wantErr: "forbidden_operation"},
		{name: "first document under the limit", token: cashier, method: http.MethodPost, path: "/kv/vendas/create", body: document("valor", 10), wantCode: http.StatusCreated},
		{name: "second document reaches the limit", token: cashier, method: http.MethodPost, path: "/kv/vendas/create", body: document("valor", 20), wantCode: http.StatusCreated},
		{name: "third document is over the limit", token: cashier, method: http.MethodPost, path: "/kv/vendas/create", body: document("valor", 30), wantCode: http.StatusConflict, wantErr: "collection_full"},
		{name: "import over the limit is refused", token: cashier, method: http.MethodPost, path: "/kv/vendas/import", body: map[string]any{"data": []map[string]any{{"valor": 40}}}, wantCode: http.StatusConflict, wantErr: "collection_full"},
		{name: "admin ignores role limits", token: app.Token, method: http.MethodPost, path: "/kv/vendas/create", body: document("valor", 50), wantCode: http.StatusCreated},
		{name: "own documents role cannot read another role's document", token: customer, method: http.MethodGet, path: "/kv/pedidos/get/" + order, wantCode: http.StatusNotFound, wantErr: "document_not_found"},
		{name: "own documents role cannot update another role's document", token: customer, method: http.MethodPatch, path: "/kv/pedidos/update/" + order, body: document("item", "chá"), wantCode: http.StatusNotFound, wantErr: "document_not_found"},
		{name: "own documents role cannot delete another role's document", token: customer, method: http.MethodDelete, path: "/kv/pedidos/delete/" + order, wantCode: http.StatusNotFound, wantErr: "document_not_found"},
		{name: "creator role still reads its document", token: seller, method: http.MethodGet, path: "/kv/pedidos/get/" + order, wantCode: http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := env.KV(tt.token, tt.method, tt.path, tt.body)
			if response.Status != tt.wantCode || response.Code() != tt.wantErr {
				t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
			}
		})
	}

	t.Run("own documents list hides other roles", func(t *testing.T) {
		documentID(t, env.KV(customer, http.MethodPost, "/kv/pedidos/create", document("item", "pão")))
		if count := countDocuments(t, env, customer, "pedidos"); count != 1 {
			t.Fatalf("customer sees %d orders, want 1", count)
		}
		if count := countDocuments(t, env, app.Token, "pedidos"); count != 2 {
			t.Fatalf("admin sees %d orders, want 2", count)
		}
	})
}

func TestKVRoleManagement(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	app := env.CreateApp("Loja")
	env.CreateRole(app, "caixa", false, testenv.Rule{Collection: "*", Operations: []string{"read"}})
	env.CreateToken(app, "caixa")

	tests := []struct {
		name     string
		method   string
		path     string
		body     any
		wantCode int
		wantErr  string
	}{
		{name: "admin name is reserved", method: http.MethodPost, path: "/roles/create", body: roleBody("admin"), wantCode: http.StatusBadRequest, wantErr: "role_reserved"},
		{name: "invalid name is refused", method: http.MethodPost, path: "/roles/create", body: roleBody("Meu Cargo"), wantCode: http.StatusBadRequest, wantErr: "invalid_role_name"},
		{name: "duplicate name is refused", method: http.MethodPost, path: "/roles/create", body: roleBody("caixa"), wantCode: http.StatusConflict, wantErr: "role_taken"},
		{name: "role used by a token cannot be deleted", method: http.MethodDelete, path: "/roles/caixa/delete", wantCode: http.StatusConflict, wantErr: "role_in_use"},
		{name: "token cannot use a missing role", method: http.MethodPost, path: "/tokens/create", body: map[string]any{"name": "x", "validityDays": 1, "role": "fantasma"}, wantCode: http.StatusNotFound, wantErr: "role_not_found"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := env.Admin(tt.method, "/apps/"+app.ID+tt.path, tt.body)
			if response.Status != tt.wantCode || response.Code() != tt.wantErr {
				t.Fatalf("status %d code %q, want %d %q: %s", response.Status, response.Code(), tt.wantCode, tt.wantErr, response.Body)
			}
		})
	}
}

func roleBody(name string) map[string]any {
	return map[string]any{"name": name, "rules": []testenv.Rule{{Collection: "*", Operations: []string{"read"}}}}
}
