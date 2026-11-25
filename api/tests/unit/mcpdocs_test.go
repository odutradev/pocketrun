package unit

import (
	"errors"
	"os"
	"strings"
	"testing"

	"pocketrun-api/internal/domains/mcp/utils/mcpdocs"
)

func TestMCPDocsGuideMatchesRoot(t *testing.T) {
	root, err := os.ReadFile("../../../llms.txt")
	if err != nil {
		t.Fatalf("read root llms.txt: %v", err)
	}
	normalize := func(text string) string { return strings.ReplaceAll(text, "\r\n", "\n") }
	if normalize(string(root)) != normalize(mcpdocs.Guide()) {
		t.Fatal("embedded llms.txt is out of date: run npm run sync:llms")
	}
}

func TestMCPDocsSlugify(t *testing.T) {
	tests := []struct {
		name  string
		title string
		want  string
	}{
		{name: "accents and colon", title: "KV: autenticação", want: "kv-autenticacao"},
		{name: "dots and spaces", title: "Páginas: dados com pocketrun.kv", want: "paginas-dados-com-pocketrun-kv"},
		{name: "plain word", title: "Links", want: "links"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := mcpdocs.Slugify(tt.title); got != tt.want {
				t.Fatalf("Slugify = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestMCPDocsText(t *testing.T) {
	instance := mcpdocs.Instance{APIURL: "https://api.exemplo.com", PagesURL: "https://p.exemplo.com"}
	slugs := map[string]bool{}
	for _, slug := range mcpdocs.Slugs() {
		if slugs[slug] {
			t.Fatalf("duplicate section %s", slug)
		}
		slugs[slug] = true
	}

	tests := []struct {
		name     string
		section  string
		contains []string
		excludes []string
		wantErr  error
	}{
		{name: "whole guide", section: "", contains: []string{"https://api.exemplo.com", "https://p.exemplo.com", "## KV: cargos", "## MCP: como montar com as ferramentas"}},
		{name: "one section", section: "paginas-dados-com-pocketrun-kv", contains: []string{"pocketrun.kv.collection"}, excludes: []string{"## KV: cargos"}},
		{name: "unknown section", section: "nada", wantErr: mcpdocs.ErrUnknownSection},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			text, err := mcpdocs.Text(tt.section, instance)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("Text error = %v, want %v", err, tt.wantErr)
			}
			for _, part := range tt.contains {
				if !strings.Contains(text, part) {
					t.Fatalf("text misses %q", part)
				}
			}
			for _, part := range tt.excludes {
				if strings.Contains(text, part) {
					t.Fatalf("text has %q", part)
				}
			}
		})
	}
}
