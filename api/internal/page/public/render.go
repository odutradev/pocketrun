package public

import (
	"html"
	"strings"

	"pocketrun-api/internal/page/page"
)

func render(target page.Page, extra runtimeExtra) (string, error) {
	tag, err := runtimeTag(target, extra)
	if err != nil {
		return "", err
	}
	return injectRuntime(document(target), tag), nil
}

func document(target page.Page) string {
	lower := strings.ToLower(target.HTML)
	if strings.Contains(lower, "<html") || strings.Contains(lower, "<!doctype") {
		return target.HTML
	}

	var builder strings.Builder
	builder.WriteString("<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n")
	builder.WriteString("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>")
	builder.WriteString(html.EscapeString(target.Title))
	builder.WriteString("</title>\n</head>\n<body>\n")
	builder.WriteString(target.HTML)
	builder.WriteString("\n</body>\n</html>\n")
	return builder.String()
}
