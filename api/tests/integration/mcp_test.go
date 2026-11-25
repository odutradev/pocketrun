package integration

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"pocketrun-api/tests/testenv"
)

type rpcReply struct {
	Result json.RawMessage `json:"result"`
	Error  *struct {
		Code int `json:"code"`
	} `json:"error"`
}

type toolCallResult struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
	IsError bool `json:"isError"`
}

func createAPIKey(t *testing.T, env *testenv.Env, scope string) string {
	t.Helper()
	response := env.Admin(http.MethodPost, "/auth/api-keys/create", map[string]any{"name": "IA " + scope, "scope": scope})
	env.Expect(response, http.StatusCreated, "create api key")
	var created struct {
		RawKey string `json:"rawKey"`
	}
	response.Decode(t, &created)
	return created.RawKey
}

func callMCP(t *testing.T, env *testenv.Env, key, method string, params any) (testenv.Response, rpcReply) {
	t.Helper()
	headers := map[string]string{}
	if key != "" {
		headers["Authorization"] = "Bearer " + key
	}
	response := env.Do(testenv.Request{
		Method:  http.MethodPost,
		Path:    "/mcp",
		Body:    map[string]any{"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
		Headers: headers,
	})
	var reply rpcReply
	if response.Status == http.StatusOK {
		response.Decode(t, &reply)
	}
	return response, reply
}

func toolNames(t *testing.T, reply rpcReply) map[string]bool {
	t.Helper()
	var list struct {
		Tools []struct {
			Name string `json:"name"`
		} `json:"tools"`
	}
	if err := json.Unmarshal(reply.Result, &list); err != nil {
		t.Fatalf("decode tools: %v", err)
	}
	names := map[string]bool{}
	for _, tool := range list.Tools {
		names[tool.Name] = true
	}
	return names
}

func TestMCPAuthentication(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	key := createAPIKey(t, env, "read")

	tests := []struct {
		name       string
		key        string
		wantStatus int
	}{
		{name: "missing key is rejected", key: "", wantStatus: http.StatusUnauthorized},
		{name: "unknown key is rejected", key: "prk_" + testenv.RandomText(64), wantStatus: http.StatusUnauthorized},
		{name: "panel token is rejected", key: "pk_live_" + testenv.RandomText(48), wantStatus: http.StatusUnauthorized},
		{name: "valid key initializes", key: key, wantStatus: http.StatusOK},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, _ := callMCP(t, env, tt.key, "initialize", map[string]any{"protocolVersion": "2025-06-18"})
			env.Expect(response, tt.wantStatus, tt.name)
		})
	}
}

func TestMCPToolScopes(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()

	tests := []struct {
		name        string
		scope       string
		wantTools   []string
		hiddenTools []string
	}{
		{name: "read key lists only reads", scope: "read", wantTools: []string{"pages_list", "links_get"}, hiddenTools: []string{"pages_create", "pages_delete"}},
		{name: "write key adds writes", scope: "write", wantTools: []string{"pages_list", "pages_create"}, hiddenTools: []string{"pages_delete", "kv_app_delete"}},
		{name: "full key lists deletes", scope: "full", wantTools: []string{"pages_create", "pages_delete", "kv_app_delete"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			key := createAPIKey(t, env, tt.scope)
			response, reply := callMCP(t, env, key, "tools/list", map[string]any{})
			env.Expect(response, http.StatusOK, "list tools")
			names := toolNames(t, reply)
			for _, name := range tt.wantTools {
				if !names[name] {
					t.Fatalf("tool %s missing for scope %s", name, tt.scope)
				}
			}
			for _, name := range tt.hiddenTools {
				if names[name] {
					t.Fatalf("tool %s listed for scope %s", name, tt.scope)
				}
			}
		})
	}
}

func TestMCPToolCall(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	readKey := createAPIKey(t, env, "read")
	writeKey := createAPIKey(t, env, "write")
	createPage := map[string]any{"name": "pages_create", "arguments": map[string]any{"body": map[string]any{"title": "Via MCP", "mode": "active", "html": "<h1>oi</h1>"}}}

	response, reply := callMCP(t, env, readKey, "tools/call", createPage)
	env.Expect(response, http.StatusOK, "read key calls write tool")
	if reply.Error == nil {
		t.Fatalf("read key created a page: %s", reply.Result)
	}

	response, reply = callMCP(t, env, writeKey, "tools/call", createPage)
	env.Expect(response, http.StatusOK, "write key creates page")
	var created toolCallResult
	if err := json.Unmarshal(reply.Result, &created); err != nil || created.IsError || len(created.Content) == 0 {
		t.Fatalf("create page result: %s", reply.Result)
	}
	var page struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal([]byte(created.Content[0].Text), &page); err != nil || page.ID == "" {
		t.Fatalf("decode created page: %s", created.Content[0].Text)
	}

	response, reply = callMCP(t, env, readKey, "tools/call", map[string]any{"name": "pages_get", "arguments": map[string]any{"id": page.ID}})
	env.Expect(response, http.StatusOK, "read key gets page")
	var fetched toolCallResult
	if err := json.Unmarshal(reply.Result, &fetched); err != nil || fetched.IsError {
		t.Fatalf("get page result: %s", reply.Result)
	}

	response, reply = callMCP(t, env, readKey, "tools/call", map[string]any{"name": "pages_get", "arguments": map[string]any{}})
	env.Expect(response, http.StatusOK, "missing argument")
	var missing toolCallResult
	if err := json.Unmarshal(reply.Result, &missing); err != nil || !missing.IsError {
		t.Fatalf("missing id result: %s", reply.Result)
	}

	env.Expect(env.Admin(http.MethodGet, "/pages/"+page.ID+"/details", nil), http.StatusOK, "panel sees page created by mcp")
}

func TestMCPDocsTool(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	key := createAPIKey(t, env, "read")

	response, reply := callMCP(t, env, key, "tools/list", map[string]any{})
	env.Expect(response, http.StatusOK, "list tools")
	if !toolNames(t, reply)["docs"] {
		t.Fatal("docs tool missing for read key")
	}

	tests := []struct {
		name      string
		arguments map[string]any
		wantError bool
		contains  string
	}{
		{name: "whole guide", arguments: map[string]any{}, contains: "pocketrun.kv.collection"},
		{name: "one section", arguments: map[string]any{"section": "kv-cargos"}, contains: "isOwnDocumentsOnly"},
		{name: "unknown section", arguments: map[string]any{"section": "nada"}, wantError: true, contains: "kv-cargos"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, reply := callMCP(t, env, key, "tools/call", map[string]any{"name": "docs", "arguments": tt.arguments})
			env.Expect(response, http.StatusOK, tt.name)
			var result toolCallResult
			if err := json.Unmarshal(reply.Result, &result); err != nil || len(result.Content) == 0 {
				t.Fatalf("docs result: %s", reply.Result)
			}
			if result.IsError != tt.wantError {
				t.Fatalf("isError = %v, want %v", result.IsError, tt.wantError)
			}
			if !strings.Contains(result.Content[0].Text, tt.contains) {
				t.Fatalf("docs text misses %q", tt.contains)
			}
		})
	}
}

func TestMCPRevokedKey(t *testing.T) {
	env := testenv.Start(t)
	env.Setup()
	key := createAPIKey(t, env, "read")

	var keys []struct {
		ID string `json:"id"`
	}
	list := env.Admin(http.MethodGet, "/auth/api-keys/list", nil)
	env.Expect(list, http.StatusOK, "list api keys")
	list.Decode(t, &keys)
	if len(keys) != 1 || list.Contains(key) {
		t.Fatalf("list api keys: %s", list.Body)
	}

	env.Expect(env.Admin(http.MethodDelete, "/auth/api-keys/"+keys[0].ID+"/delete", nil), http.StatusNoContent, "revoke api key")
	response, _ := callMCP(t, env, key, "ping", map[string]any{})
	env.Expect(response, http.StatusUnauthorized, "revoked key")
}
