package unit

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"pocketrun-api/internal/domains/mcp/utils/mcptools"
	apikeyrepository "pocketrun-api/internal/repositories/apikey"
)

func TestScopeAllows(t *testing.T) {
	tests := []struct {
		name     string
		scope    apikeyrepository.Scope
		required apikeyrepository.Scope
		want     bool
	}{
		{name: "read allows read", scope: apikeyrepository.ScopeRead, required: apikeyrepository.ScopeRead, want: true},
		{name: "read denies write", scope: apikeyrepository.ScopeRead, required: apikeyrepository.ScopeWrite, want: false},
		{name: "write denies full", scope: apikeyrepository.ScopeWrite, required: apikeyrepository.ScopeFull, want: false},
		{name: "full allows write", scope: apikeyrepository.ScopeFull, required: apikeyrepository.ScopeWrite, want: true},
		{name: "unknown denies read", scope: apikeyrepository.Scope("admin"), required: apikeyrepository.ScopeRead, want: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.scope.Allows(tt.required); got != tt.want {
				t.Fatalf("Allows = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestToolCatalogShape(t *testing.T) {
	names := map[string]bool{}
	for _, tool := range mcptools.Allowed(apikeyrepository.ScopeFull) {
		if names[tool.Name] {
			t.Fatalf("duplicate tool %s", tool.Name)
		}
		names[tool.Name] = true
		for _, param := range tool.PathParams {
			if !strings.Contains(tool.Path, "{"+param.Name+"}") {
				t.Fatalf("tool %s: path %s has no {%s}", tool.Name, tool.Path, param.Name)
			}
		}
		if strings.Count(tool.Path, "{") != len(tool.PathParams) {
			t.Fatalf("tool %s: path %s and params differ", tool.Name, tool.Path)
		}
	}
}

func TestToolRequest(t *testing.T) {
	get, err := mcptools.Find(apikeyrepository.ScopeRead, "pages_version_get")
	if err != nil {
		t.Fatalf("find tool: %v", err)
	}
	list, err := mcptools.Find(apikeyrepository.ScopeRead, "pages_list")
	if err != nil {
		t.Fatalf("find tool: %v", err)
	}

	tests := []struct {
		name       string
		tool       mcptools.Tool
		args       string
		wantTarget string
		wantErr    error
	}{
		{name: "path params are filled", tool: get, args: `{"id":"abc","number":3}`, wantTarget: "/pages/abc/versions/3/details"},
		{name: "path params are escaped", tool: get, args: `{"id":"../x","number":1}`, wantTarget: "/pages/..%2Fx/versions/1/details"},
		{name: "missing path param fails", tool: get, args: `{"id":"abc"}`, wantErr: mcptools.ErrMissingParam},
		{name: "query params are encoded", tool: list, args: `{"search":"oi","limit":5}`, wantTarget: "/pages/list?limit=5&search=oi"},
		{name: "object argument fails", tool: list, args: `{"search":{"a":1}}`, wantErr: mcptools.ErrInvalidParams},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request, err := tt.tool.Request(json.RawMessage(tt.args))
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("request: %v", err)
			}
			if request.Target != tt.wantTarget {
				t.Fatalf("target = %s, want %s", request.Target, tt.wantTarget)
			}
		})
	}
}

func TestToolFindRespectsScope(t *testing.T) {
	if _, err := mcptools.Find(apikeyrepository.ScopeRead, "pages_delete"); !errors.Is(err, mcptools.ErrUnknownTool) {
		t.Fatalf("read scope found pages_delete: %v", err)
	}
	if _, err := mcptools.Find(apikeyrepository.ScopeFull, "pages_delete"); err != nil {
		t.Fatalf("full scope: %v", err)
	}
}
