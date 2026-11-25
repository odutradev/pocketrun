package mcpdocs

import (
	_ "embed"
	"errors"
	"fmt"
	"strings"
)

const sectionPrefix = "## "

var ErrUnknownSection = errors.New("unknown docs section")

//go:embed llms.txt
var guide string

type Section struct {
	Slug  string
	Title string
	body  string
}

type Instance struct {
	APIURL   string
	PagesURL string
}

func Guide() string {
	return guide
}

func Sections() []Section {
	sections := []Section{}
	lines := strings.Split(strings.ReplaceAll(guide, "\r\n", "\n"), "\n")
	inFence := false
	current := -1
	for _, line := range lines {
		if strings.HasPrefix(line, "```") {
			inFence = !inFence
		}
		if !inFence && strings.HasPrefix(line, sectionPrefix) {
			title := strings.TrimSpace(strings.TrimPrefix(line, sectionPrefix))
			sections = append(sections, Section{Slug: Slugify(title), Title: title})
			current = len(sections) - 1
		}
		if current >= 0 {
			sections[current].body += line + "\n"
		}
	}
	return sections
}

func Slugs() []string {
	sections := Sections()
	slugs := make([]string, 0, len(sections))
	for _, section := range sections {
		slugs = append(slugs, section.Slug)
	}
	return slugs
}

func Text(slug string, instance Instance) (string, error) {
	header := instanceHeader(instance)
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return header + guide, nil
	}
	for _, section := range Sections() {
		if section.Slug == slug {
			return header + strings.TrimRight(section.body, "\n") + "\n", nil
		}
	}
	return "", fmt.Errorf("%w: %s", ErrUnknownSection, slug)
}

func instanceHeader(instance Instance) string {
	return fmt.Sprintf("Esta instância: {api} = %s e {dominio} = %s. Seções: %s.\n\n", instance.APIURL, instance.PagesURL, strings.Join(Slugs(), ", "))
}

func Slugify(title string) string {
	replacer := strings.NewReplacer(
		"á", "a", "à", "a", "â", "a", "ã", "a", "é", "e", "ê", "e", "í", "i",
		"ó", "o", "ô", "o", "õ", "o", "ú", "u", "ü", "u", "ç", "c",
	)
	normalized := replacer.Replace(strings.ToLower(title))
	var builder strings.Builder
	dash := false
	for _, r := range normalized {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			builder.WriteRune(r)
			dash = false
			continue
		}
		if !dash && builder.Len() > 0 {
			builder.WriteByte('-')
			dash = true
		}
	}
	return strings.TrimSuffix(builder.String(), "-")
}
