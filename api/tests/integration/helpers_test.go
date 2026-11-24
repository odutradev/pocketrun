package integration

import (
	"net/http"
	"testing"

	"pocketrun-api/tests/testenv"
)

type storedDocument struct {
	ID             string         `json:"id"`
	AppID          string         `json:"appId"`
	CollectionName string         `json:"collectionName"`
	Data           map[string]any `json:"data"`
}

func document(key string, value any) map[string]any {
	return map[string]any{"data": map[string]any{key: value}}
}

func documentID(t *testing.T, response testenv.Response) string {
	t.Helper()
	if response.Status != http.StatusCreated {
		t.Fatalf("create document: status %d: %s", response.Status, response.Body)
	}
	var created storedDocument
	response.Decode(t, &created)
	return created.ID
}

func listDocuments(t *testing.T, env *testenv.Env, token, path string) []storedDocument {
	t.Helper()
	response := env.KV(token, http.MethodGet, path, nil)
	if response.Status != http.StatusOK {
		t.Fatalf("list %s: status %d: %s", path, response.Status, response.Body)
	}
	var documents []storedDocument
	response.Decode(t, &documents)
	return documents
}

func countDocuments(t *testing.T, env *testenv.Env, token, collection string) int {
	t.Helper()
	response := env.KV(token, http.MethodGet, "/kv/"+collection+"/count", nil)
	if response.Status != http.StatusOK {
		t.Fatalf("count %s: status %d: %s", collection, response.Status, response.Body)
	}
	var counted struct {
		Count int `json:"count"`
	}
	response.Decode(t, &counted)
	return counted.Count
}
