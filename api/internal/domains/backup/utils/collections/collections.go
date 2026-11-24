package collections

import "slices"

const (
	GroupContent = "content"
	GroupHistory = "history"
)

var content = []string{
	"users",
	"applications",
	"kvDocuments",
	"groups",
	"slugs",
	"links",
	"pages",
	"pageVersions",
	"pageAccess",
	"pageBindings",
}

var history = []string{
	"linkEvents",
	"pageEvents",
	"linkOpens",
	"pageOpens",
	"kvUsage",
	"pageKvRequests",
	"uniqueVisitors",
}

func For(isContentOnly bool) []string {
	if isContentOnly {
		return slices.Clone(content)
	}
	return slices.Concat(content, history)
}

func IsKnown(name string) bool {
	return slices.Contains(content, name) || slices.Contains(history, name)
}

func GroupOf(name string) string {
	if slices.Contains(history, name) {
		return GroupHistory
	}
	return GroupContent
}
