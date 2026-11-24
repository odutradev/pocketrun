package unit

import (
	"testing"

	"go.mongodb.org/mongo-driver/v2/bson"

	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
)

func TestKVDocumentScopeFilter(t *testing.T) {
	appID := bson.NewObjectID()

	tests := []struct {
		name  string
		scope kvdocumentrepository.Scope
		want  bson.M
	}{
		{name: "limits to app and collection", scope: kvdocumentrepository.Scope{ApplicationID: appID, Role: "caixa"}, want: bson.M{"appId": appID, "collectionName": "vendas"}},
		{name: "adds creator role for own documents", scope: kvdocumentrepository.Scope{ApplicationID: appID, Role: "cliente", IsOwnDocumentsOnly: true}, want: bson.M{"appId": appID, "collectionName": "vendas", "createdByRole": "cliente"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.scope.Filter("vendas")
			if len(got) != len(tt.want) {
				t.Fatalf("Filter() = %v, want %v", got, tt.want)
			}
			for key, value := range tt.want {
				if got[key] != value {
					t.Errorf("Filter()[%q] = %v, want %v", key, got[key], value)
				}
			}
		})
	}
}
