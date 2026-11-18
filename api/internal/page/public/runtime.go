package public

import (
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"pocketrun-api/internal/page/page"
)

const runtimeAPIVersion = 1

const runtimeScript = `(function(info){if("pocketrun" in window)return;var page=Object.freeze(info);Object.defineProperty(window,"pocketrun",{value:Object.freeze({apiVersion:%d,page:page}),enumerable:false});var date=new Date(page.updatedAt).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});console.log("%%cPocketRun%%c "+page.slug+" · v"+page.version+(page.isPreview?" · prévia do editor":" · atualizada em "+date),"background:#ffc93c;color:#111;font-weight:700;padding:1px 6px;border-radius:4px","color:inherit")})(%s);`

var (
	headPattern    = regexp.MustCompile(`(?i)<head(\s[^>]*)?>`)
	htmlPattern    = regexp.MustCompile(`(?i)<html(\s[^>]*)?>`)
	doctypePattern = regexp.MustCompile(`(?i)<!doctype[^>]*>`)
)

type runtimePage struct {
	Slug      string `json:"slug"`
	Title     string `json:"title"`
	Version   int    `json:"version"`
	UpdatedAt string `json:"updatedAt"`
	IsPreview bool   `json:"isPreview"`
}

func runtimeTag(target page.Page) (string, error) {
	info, err := json.Marshal(runtimePage{
		Slug:      target.Slug,
		Title:     target.Title,
		Version:   target.Version,
		UpdatedAt: target.UpdatedAt.UTC().Format(time.RFC3339),
	})
	if err != nil {
		return "", fmt.Errorf("encode page runtime: %w", err)
	}
	return "<script>" + fmt.Sprintf(runtimeScript, runtimeAPIVersion, info) + "</script>", nil
}

func injectRuntime(document, tag string) string {
	for _, pattern := range []*regexp.Regexp{headPattern, htmlPattern, doctypePattern} {
		if location := pattern.FindStringIndex(document); location != nil {
			return document[:location[1]] + "\n" + tag + document[location[1]:]
		}
	}
	return tag + "\n" + document
}
