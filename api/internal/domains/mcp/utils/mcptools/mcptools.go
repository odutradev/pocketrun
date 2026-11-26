package mcptools

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	apikeyrepository "pocketrun-api/internal/repositories/apikey"
)

var (
	ErrUnknownTool   = errors.New("unknown tool")
	ErrInvalidArgs   = errors.New("invalid tool arguments")
	ErrMissingParam  = errors.New("missing required argument")
	ErrInvalidParams = errors.New("invalid argument type")
)

type Schema map[string]any

type Param struct {
	Name   string
	Schema Schema
}

type Tool struct {
	Name        string
	Title       string
	Description string
	Scope       apikeyrepository.Scope
	Method      string
	Path        string
	PathParams  []Param
	Query       []Param
	Body        Schema
	BodyNeeded  bool
}

type Request struct {
	Method string
	Target string
	Body   []byte
}

func (t Tool) InputSchema() Schema {
	properties := Schema{}
	required := []string{}
	for _, param := range t.PathParams {
		properties[param.Name] = param.Schema
		required = append(required, param.Name)
	}
	for _, param := range t.Query {
		properties[param.Name] = param.Schema
	}
	if t.Body != nil {
		properties["body"] = t.Body
		if t.BodyNeeded {
			required = append(required, "body")
		}
	}
	return Schema{"type": "object", "properties": properties, "required": required, "additionalProperties": false}
}

func (t Tool) Annotations() Schema {
	return Schema{
		"title":           t.Title,
		"readOnlyHint":    t.Method == http.MethodGet,
		"destructiveHint": t.Scope == apikeyrepository.ScopeFull,
		"idempotentHint":  t.Method == http.MethodGet || t.Method == http.MethodPatch,
		"openWorldHint":   false,
	}
}

func (t Tool) Request(raw json.RawMessage) (Request, error) {
	args := map[string]json.RawMessage{}
	if len(raw) > 0 && string(raw) != "null" {
		if err := json.Unmarshal(raw, &args); err != nil {
			return Request{}, fmt.Errorf("%w: %w", ErrInvalidArgs, err)
		}
	}

	path := t.Path
	for _, param := range t.PathParams {
		value, err := scalar(args[param.Name])
		if err != nil {
			return Request{}, fmt.Errorf("%s: %w", param.Name, err)
		}
		if value == "" {
			return Request{}, fmt.Errorf("%s: %w", param.Name, ErrMissingParam)
		}
		path = strings.Replace(path, "{"+param.Name+"}", url.PathEscape(value), 1)
	}

	query := url.Values{}
	for _, param := range t.Query {
		value, err := scalar(args[param.Name])
		if err != nil {
			return Request{}, fmt.Errorf("%s: %w", param.Name, err)
		}
		if value != "" {
			query.Set(param.Name, value)
		}
	}
	if encoded := query.Encode(); encoded != "" {
		path += "?" + encoded
	}

	request := Request{Method: t.Method, Target: path}
	if t.Body == nil {
		return request, nil
	}

	body, ok := args["body"]
	if !ok || string(body) == "null" {
		if t.BodyNeeded {
			return Request{}, fmt.Errorf("body: %w", ErrMissingParam)
		}
		body = json.RawMessage("{}")
	}
	request.Body = body
	return request, nil
}

func scalar(raw json.RawMessage) (string, error) {
	if len(raw) == 0 || string(raw) == "null" {
		return "", nil
	}

	var text string
	if err := json.Unmarshal(raw, &text); err == nil {
		return strings.TrimSpace(text), nil
	}

	var number json.Number
	if err := json.Unmarshal(raw, &number); err == nil {
		return number.String(), nil
	}

	var flag bool
	if err := json.Unmarshal(raw, &flag); err == nil {
		return strconv.FormatBool(flag), nil
	}
	return "", ErrInvalidParams
}

func Allowed(scope apikeyrepository.Scope) []Tool {
	tools := []Tool{}
	for _, tool := range catalog() {
		if scope.Allows(tool.Scope) {
			tools = append(tools, tool)
		}
	}
	return tools
}

func Find(scope apikeyrepository.Scope, name string) (Tool, error) {
	for _, tool := range Allowed(scope) {
		if tool.Name == name {
			return tool, nil
		}
	}
	return Tool{}, ErrUnknownTool
}

func text(description string) Schema {
	return Schema{"type": "string", "description": description}
}

func limitedText(description string, maxLength int) Schema {
	return Schema{"type": "string", "description": description, "maxLength": maxLength}
}

func integer(description string, minimum, maximum int) Schema {
	schema := Schema{"type": "integer", "description": description, "minimum": minimum}
	if maximum > 0 {
		schema["maximum"] = maximum
	}
	return schema
}

func boolean(description string) Schema {
	return Schema{"type": "boolean", "description": description}
}

func enum(description string, values ...string) Schema {
	return Schema{"type": "string", "description": description, "enum": values}
}

func dateTime(description string) Schema {
	return Schema{"type": "string", "format": "date-time", "description": description}
}

func list(description string, items Schema) Schema {
	return Schema{"type": "array", "description": description, "items": items}
}

func object(description string, properties Schema, required ...string) Schema {
	return Schema{"type": "object", "description": description, "properties": properties, "required": required, "additionalProperties": false}
}

func freeObject(description string) Schema {
	return Schema{"type": "object", "description": description, "additionalProperties": true}
}

func id(description string) Param {
	return Param{Name: "id", Schema: text(description)}
}

func activationProperties(properties Schema) Schema {
	properties["mode"] = enum("active: always on; inactive: off; period: on between startsAt and endsAt; clicks: on until maxClicks", "active", "inactive", "period", "clicks")
	properties["startsAt"] = dateTime("Start of the period (RFC 3339), used with mode period")
	properties["endsAt"] = dateTime("End of the period (RFC 3339), used with mode period")
	properties["maxClicks"] = integer("Opens allowed before it turns off, used with mode clicks", 1, 0)
	properties["countBy"] = enum("What counts toward maxClicks", "clicks", "visitors")
	return properties
}

func listQuery(kind string) []Param {
	return []Param{
		{Name: "search", Schema: limitedText("Text searched in the "+kind+" title and slug", 100)},
		{Name: "groupId", Schema: text("Group id, or none for items without a group")},
		{Name: "state", Schema: enum("Current state", "active", "inactive", "scheduled", "expired", "exhausted")},
		{Name: "sort", Schema: enum("Order", "recent", "clicks", "title", "expiring")},
		{Name: "page", Schema: integer("Page number", 1, 0)},
		{Name: "limit", Schema: integer("Items per page", 1, 100)},
	}
}

func groupBody() Schema {
	return object("Group fields", Schema{
		"name":  limitedText("Group name", 60),
		"color": enum("Group color", "gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"),
		"icon":  enum("Group icon", "stack", "bookmark", "star", "heart", "rocket", "lightning", "globe", "chat", "calendar", "target", "archive", "backpack", "home", "person", "code", "magic"),
	}, "name")
}

func statusBody() Schema {
	return object("New status", Schema{"isActive": boolean("true turns it on, false turns it off")}, "isActive")
}

func kvRule() Schema {
	return object("Access rule for one collection", Schema{
		"collection":   limitedText("Collection name, or * for every collection", 64),
		"operations":   list("Allowed operations", enum("Operation", "read", "create", "update", "delete")),
		"maxDocuments": integer("Most documents the collection may hold through this role, 0 for no limit", 0, 1000000),
	}, "collection", "operations")
}

func kvRoleProperties(withName bool) Schema {
	properties := Schema{
		"description":        limitedText("What the role is for", 200),
		"rules":              list("From 1 to 30 rules, each collection once", kvRule()),
		"isOwnDocumentsOnly": boolean("Token sees and changes only documents it created"),
	}
	if withName {
		properties["name"] = limitedText("Role name: lowercase letters, numbers and hyphen; admin is reserved", 40)
	}
	return properties
}

func catalog() []Tool {
	read := apikeyrepository.ScopeRead
	write := apikeyrepository.ScopeWrite
	full := apikeyrepository.ScopeFull
	pageID := id("Page id")
	linkID := id("Link id")
	appID := id("KV application id")
	groupID := id("Group id")

	pageBody := object("Page fields. An update replaces every field, so send the current values you want to keep (read them with pages_get)", activationProperties(Schema{
		"title":   limitedText("Page title", 20),
		"slug":    limitedText("Address of the page; empty generates one", 64),
		"html":    text("Full HTML of the page, up to 512 KB. The page reaches its data through window.pocketrun.kv"),
		"groupId": text("Group id; empty leaves it without a group"),
		"message": limitedText("Note saved with the new version", 80),
	}), "title", "mode")

	linkBody := object("Link fields. An update replaces every field, so send the current values you want to keep (read them with links_get)", activationProperties(Schema{
		"title":   limitedText("Link title", 20),
		"slug":    limitedText("Short address; empty generates one", 64),
		"url":     limitedText("Destination URL (http or https)", 2048),
		"groupId": text("Group id; empty leaves it without a group"),
	}), "title", "url", "mode")

	kvAppBody := object("KV application fields", Schema{
		"name":                    limitedText("Application name", 100),
		"projectId":               limitedText("Project id used in the KV URL: lowercase letters, numbers and hyphen", 64),
		"description":             limitedText("Description", 500),
		"allowedOrigins":          list("Sites allowed to call from the browser, such as https://shop.example.com; [\"*\"] allows any site", text("Origin")),
		"allowNonBrowserRequests": boolean("Accept calls without the Origin header (servers, scripts, apps)"),
	}, "name", "projectId")

	kvAppUpdateBody := object("KV application fields. An update replaces every field", Schema{
		"name":                    limitedText("Application name", 100),
		"description":             limitedText("Description", 500),
		"allowedOrigins":          list("Sites allowed to call from the browser; [\"*\"] allows any site", text("Origin")),
		"allowNonBrowserRequests": boolean("Accept calls without the Origin header"),
	}, "name")

	return []Tool{
		{Name: "whoami", Title: "Current user", Description: "Returns the panel user that owns this API key.", Scope: read, Method: http.MethodGet, Path: "/auth/me/details"},
		{Name: "overview_usage", Title: "Usage overview", Description: "Opens of pages and links and KV usage over time.", Scope: read, Method: http.MethodGet, Path: "/overview/usage/details"},

		{Name: "pages_list", Title: "List pages", Description: "Lists pages with filters and pagination.", Scope: read, Method: http.MethodGet, Path: "/pages/list", Query: listQuery("page")},
		{Name: "pages_summary", Title: "Pages summary", Description: "Totals of pages per group.", Scope: read, Method: http.MethodGet, Path: "/pages/summary/details"},
		{Name: "pages_slug_check", Title: "Check page slug", Description: "Tells whether a page slug is free.", Scope: read, Method: http.MethodGet, Path: "/pages/slug-availability/check", Query: []Param{{Name: "slug", Schema: limitedText("Slug to check", 64)}, {Name: "pageId", Schema: text("Id of the page being edited, so its own slug counts as free")}}},
		{Name: "pages_get", Title: "Get page", Description: "Returns a page with its HTML and activation.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/details", PathParams: []Param{pageID}},
		{Name: "pages_versions_list", Title: "List page versions", Description: "Lists the saved versions of a page.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/versions/list", PathParams: []Param{pageID}},
		{Name: "pages_version_get", Title: "Get page version", Description: "Returns one saved version of a page, with its HTML.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/versions/{number}/details", PathParams: []Param{pageID, {Name: "number", Schema: integer("Version number", 1, 0)}}},
		{Name: "pages_history_list", Title: "Page history", Description: "Lists the changes made to a page.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/history/list", PathParams: []Param{pageID}},
		{Name: "pages_analytics_overview", Title: "Pages analytics", Description: "Opens of every page over time.", Scope: read, Method: http.MethodGet, Path: "/pages/analytics/details"},
		{Name: "pages_analytics_get", Title: "Page analytics", Description: "Opens of one page over time.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/analytics/details", PathParams: []Param{pageID}},
		{Name: "pages_access_get", Title: "Page access", Description: "PIN protection, session length and PIN keys of a page.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/access/details", PathParams: []Param{pageID}},
		{Name: "pages_kv_get", Title: "Page data", Description: "KV data linked to a page: its application, public role and role mapping.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/kv/details", PathParams: []Param{pageID}},
		{Name: "pages_kv_requests_list", Title: "Page data requests", Description: "Recent KV requests made by a page, including denied ones.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/kv/requests/list", PathParams: []Param{pageID}},
		{Name: "pages_config_export", Title: "Export page config", Description: "Returns the access and data config of a page as JSON, in the format pages_config_apply accepts.", Scope: read, Method: http.MethodGet, Path: "/pages/{id}/config/export", PathParams: []Param{pageID}},
		{Name: "page_groups_list", Title: "List page groups", Description: "Lists the page groups.", Scope: read, Method: http.MethodGet, Path: "/pages/groups/list"},

		{Name: "links_list", Title: "List links", Description: "Lists short links with filters and pagination.", Scope: read, Method: http.MethodGet, Path: "/links/list", Query: listQuery("link")},
		{Name: "links_summary", Title: "Links summary", Description: "Totals of links per group.", Scope: read, Method: http.MethodGet, Path: "/links/summary/details"},
		{Name: "links_slug_check", Title: "Check link slug", Description: "Tells whether a link slug is free.", Scope: read, Method: http.MethodGet, Path: "/links/slug-availability/check", Query: []Param{{Name: "slug", Schema: limitedText("Slug to check", 64)}, {Name: "linkId", Schema: text("Id of the link being edited, so its own slug counts as free")}}},
		{Name: "links_get", Title: "Get link", Description: "Returns a link with its destination and activation.", Scope: read, Method: http.MethodGet, Path: "/links/{id}/details", PathParams: []Param{linkID}},
		{Name: "links_history_list", Title: "Link history", Description: "Lists the changes made to a link.", Scope: read, Method: http.MethodGet, Path: "/links/{id}/history/list", PathParams: []Param{linkID}},
		{Name: "links_analytics_overview", Title: "Links analytics", Description: "Clicks of every link over time.", Scope: read, Method: http.MethodGet, Path: "/links/analytics/details"},
		{Name: "links_analytics_get", Title: "Link analytics", Description: "Clicks of one link over time.", Scope: read, Method: http.MethodGet, Path: "/links/{id}/analytics/details", PathParams: []Param{linkID}},
		{Name: "link_groups_list", Title: "List link groups", Description: "Lists the link groups.", Scope: read, Method: http.MethodGet, Path: "/links/groups/list"},

		{Name: "kv_apps_list", Title: "List KV applications", Description: "Lists the KV applications of the key owner.", Scope: read, Method: http.MethodGet, Path: "/apps/list"},
		{Name: "kv_app_get", Title: "Get KV application", Description: "Returns a KV application with its roles and tokens (without the raw tokens).", Scope: read, Method: http.MethodGet, Path: "/apps/{id}/details", PathParams: []Param{appID}},
		{Name: "kv_analytics_overview", Title: "KV analytics", Description: "Requests to the public KV API of every application over time, with failures, operations, collections and the busiest applications.", Scope: read, Method: http.MethodGet, Path: "/apps/analytics/details"},
		{Name: "kv_analytics_get", Title: "KV application analytics", Description: "Requests to the public KV API of one application over time, with failures, operations and collections.", Scope: read, Method: http.MethodGet, Path: "/apps/{id}/analytics/details", PathParams: []Param{appID}},
		{Name: "kv_app_config_export", Title: "Export KV application config", Description: "Returns name, origins, roles and token roles of an application as JSON, in the format kv_app_config_apply accepts.", Scope: read, Method: http.MethodGet, Path: "/apps/{id}/config/export", PathParams: []Param{appID}},
		{Name: "kv_collections_list", Title: "List KV collections", Description: "Lists the collections of a KV application with their document counts.", Scope: read, Method: http.MethodGet, Path: "/apps/{id}/explorer/collections/list", PathParams: []Param{appID}},
		{Name: "kv_documents_list", Title: "List KV documents", Description: "Lists the documents of a collection, newest first.", Scope: read, Method: http.MethodGet, Path: "/apps/{id}/explorer/collections/{collection}/documents/list", PathParams: []Param{appID, {Name: "collection", Schema: limitedText("Collection name", 64)}}, Query: []Param{{Name: "page", Schema: integer("Page number", 1, 0)}, {Name: "limit", Schema: integer("Documents per page", 1, 100)}}},

		{Name: "pages_create", Title: "Create page", Description: "Creates a page from HTML. Returns the page with its id and slug.", Scope: write, Method: http.MethodPost, Path: "/pages/create", Body: pageBody, BodyNeeded: true},
		{Name: "pages_update", Title: "Update page", Description: "Replaces the fields of a page and saves a new version when the HTML changes.", Scope: write, Method: http.MethodPatch, Path: "/pages/{id}/update", PathParams: []Param{pageID}, Body: pageBody, BodyNeeded: true},
		{Name: "pages_status_set", Title: "Turn page on or off", Description: "Turns a page on or off.", Scope: write, Method: http.MethodPatch, Path: "/pages/{id}/status/set", PathParams: []Param{pageID}, Body: statusBody(), BodyNeeded: true},
		{Name: "pages_config_apply", Title: "Apply page config", Description: "Applies the access and data config of a page in one JSON: PIN protection, PINs, KV data and roles. Read the current one with pages_config_export; the format is described in the section \"Páginas: configuração de acesso e dados em JSON\" of /llms.txt.", Scope: write, Method: http.MethodPost, Path: "/pages/{id}/config/apply", PathParams: []Param{pageID}, Body: freeObject("Config JSON with version, access and kv"), BodyNeeded: true},
		{Name: "pages_access_status_set", Title: "Turn page PIN on or off", Description: "Turns the PIN protection of a page on or off.", Scope: write, Method: http.MethodPatch, Path: "/pages/{id}/access/status/set", PathParams: []Param{pageID}, Body: object("New protection status", Schema{"isEnabled": boolean("true asks for a PIN to open the page")}, "isEnabled"), BodyNeeded: true},
		{Name: "pages_access_session_set", Title: "Set page session length", Description: "Sets how long a visitor stays unlocked after typing the PIN.", Scope: write, Method: http.MethodPatch, Path: "/pages/{id}/access/session/set", PathParams: []Param{pageID}, Body: object("Session length", Schema{"sessionHours": integer("Hours", 1, 720)}, "sessionHours"), BodyNeeded: true},
		{Name: "pages_access_key_create", Title: "Create page PIN", Description: "Creates a PIN for a page. Returns the PIN.", Scope: write, Method: http.MethodPost, Path: "/pages/{id}/access/keys/create", PathParams: []Param{pageID}, Body: object("PIN fields", Schema{"role": limitedText("Page role this PIN unlocks; empty for the default role", 64), "pin": text("Six digits; empty generates one")})},
		{Name: "pages_access_key_update", Title: "Change page PIN role", Description: "Changes the page role of a PIN.", Scope: write, Method: http.MethodPatch, Path: "/pages/{id}/access/keys/{keyId}/update", PathParams: []Param{pageID, {Name: "keyId", Schema: text("PIN key id")}}, Body: object("PIN fields", Schema{"role": limitedText("Page role", 64)})},
		{Name: "pages_kv_enable", Title: "Enable page data", Description: "Creates the KV application of a page so it can store data through window.pocketrun.kv.", Scope: write, Method: http.MethodPost, Path: "/pages/{id}/kv/enable", PathParams: []Param{pageID}},
		{Name: "pages_kv_set", Title: "Set page data roles", Description: "Sets the KV role of visitors without a PIN and the KV role of each page role.", Scope: write, Method: http.MethodPatch, Path: "/pages/{id}/kv/set", PathParams: []Param{pageID}, Body: object("Role mapping", Schema{
			"publicRole": limitedText("KV role of visitors without a PIN; empty blocks them", 40),
			"roles":      list("KV role of each page role", object("Mapping", Schema{"pageRole": limitedText("Page role", 64), "kvRole": limitedText("KV role", 40)})),
		}), BodyNeeded: true},
		{Name: "page_groups_create", Title: "Create page group", Description: "Creates a page group.", Scope: write, Method: http.MethodPost, Path: "/pages/groups/create", Body: groupBody(), BodyNeeded: true},
		{Name: "page_groups_update", Title: "Update page group", Description: "Renames or restyles a page group.", Scope: write, Method: http.MethodPatch, Path: "/pages/groups/{id}/update", PathParams: []Param{groupID}, Body: groupBody(), BodyNeeded: true},

		{Name: "links_create", Title: "Create link", Description: "Creates a short link. Returns the link with its id and slug.", Scope: write, Method: http.MethodPost, Path: "/links/create", Body: linkBody, BodyNeeded: true},
		{Name: "links_update", Title: "Update link", Description: "Replaces the fields of a link.", Scope: write, Method: http.MethodPatch, Path: "/links/{id}/update", PathParams: []Param{linkID}, Body: linkBody, BodyNeeded: true},
		{Name: "links_status_set", Title: "Turn link on or off", Description: "Turns a link on or off.", Scope: write, Method: http.MethodPatch, Path: "/links/{id}/status/set", PathParams: []Param{linkID}, Body: statusBody(), BodyNeeded: true},
		{Name: "link_groups_create", Title: "Create link group", Description: "Creates a link group.", Scope: write, Method: http.MethodPost, Path: "/links/groups/create", Body: groupBody(), BodyNeeded: true},
		{Name: "link_groups_update", Title: "Update link group", Description: "Renames or restyles a link group.", Scope: write, Method: http.MethodPatch, Path: "/links/groups/{id}/update", PathParams: []Param{groupID}, Body: groupBody(), BodyNeeded: true},

		{Name: "kv_app_create", Title: "Create KV application", Description: "Creates a KV application. Returns it with an admin token, shown only once.", Scope: write, Method: http.MethodPost, Path: "/apps/create", Body: kvAppBody, BodyNeeded: true},
		{Name: "kv_app_update", Title: "Update KV application", Description: "Replaces name, description and origins of a KV application.", Scope: write, Method: http.MethodPatch, Path: "/apps/{id}/update", PathParams: []Param{appID}, Body: kvAppUpdateBody, BodyNeeded: true},
		{Name: "kv_app_config_apply", Title: "Apply KV application config", Description: "Applies name, origins, roles and token roles of an application in one JSON. Read the current one with kv_app_config_export; the format is described in the section \"KV: configuração da aplicação em JSON\" of /llms.txt.", Scope: write, Method: http.MethodPost, Path: "/apps/{id}/config/apply", PathParams: []Param{appID}, Body: freeObject("Config JSON with version, name, allowedOrigins, roles and tokens"), BodyNeeded: true},
		{Name: "kv_app_token_create", Title: "Create KV token", Description: "Creates an access token for a KV application. The raw token is returned only once.", Scope: write, Method: http.MethodPost, Path: "/apps/{id}/tokens/create", PathParams: []Param{appID}, Body: object("Token fields", Schema{
			"name":         limitedText("Token name", 100),
			"validityDays": integer("Days until it expires, 0 for never", 0, 3650),
			"role":         limitedText("Role of the token; empty or admin for full access", 40),
		})},
		{Name: "kv_app_token_role_set", Title: "Change KV token role", Description: "Changes the role of a KV token.", Scope: write, Method: http.MethodPatch, Path: "/apps/{id}/tokens/{tokenId}/role/set", PathParams: []Param{appID, {Name: "tokenId", Schema: text("Token id")}}, Body: object("New role", Schema{"role": limitedText("Role name or admin", 40)}, "role"), BodyNeeded: true},
		{Name: "kv_app_role_create", Title: "Create KV role", Description: "Creates a role with access rules per collection.", Scope: write, Method: http.MethodPost, Path: "/apps/{id}/roles/create", PathParams: []Param{appID}, Body: object("Role fields", kvRoleProperties(true), "name", "rules"), BodyNeeded: true},
		{Name: "kv_app_role_update", Title: "Update KV role", Description: "Replaces the description and rules of a role.", Scope: write, Method: http.MethodPatch, Path: "/apps/{id}/roles/{role}/update", PathParams: []Param{appID, {Name: "role", Schema: limitedText("Role name", 40)}}, Body: object("Role fields", kvRoleProperties(false), "rules"), BodyNeeded: true},

		{Name: "pages_delete", Title: "Delete page", Description: "Deletes a page with its versions, PINs and data link. Cannot be undone.", Scope: full, Method: http.MethodDelete, Path: "/pages/{id}/delete", PathParams: []Param{pageID}},
		{Name: "pages_access_key_remove", Title: "Remove page PIN", Description: "Removes a PIN from a page.", Scope: full, Method: http.MethodDelete, Path: "/pages/{id}/access/keys/{keyId}/remove", PathParams: []Param{pageID, {Name: "keyId", Schema: text("PIN key id")}}},
		{Name: "pages_access_key_pin_reset", Title: "Reset page PIN", Description: "Replaces the digits of a PIN. Returns the new PIN.", Scope: full, Method: http.MethodPost, Path: "/pages/{id}/access/keys/{keyId}/pin/reset", PathParams: []Param{pageID, {Name: "keyId", Schema: text("PIN key id")}}, Body: object("New PIN", Schema{"pin": text("Six digits; empty generates one")})},
		{Name: "pages_access_key_pin_reveal", Title: "Reveal page PIN", Description: "Shows the digits of a PIN.", Scope: full, Method: http.MethodGet, Path: "/pages/{id}/access/keys/{keyId}/pin/reveal", PathParams: []Param{pageID, {Name: "keyId", Schema: text("PIN key id")}}},
		{Name: "pages_access_sessions_revoke", Title: "Sign out page visitors", Description: "Ends every unlocked visitor session of a page.", Scope: full, Method: http.MethodPost, Path: "/pages/{id}/access/sessions/revoke", PathParams: []Param{pageID}},
		{Name: "pages_kv_remove", Title: "Remove page data", Description: "Unlinks and deletes the KV data of a page. Cannot be undone.", Scope: full, Method: http.MethodDelete, Path: "/pages/{id}/kv/remove", PathParams: []Param{pageID}},
		{Name: "page_groups_delete", Title: "Delete page group", Description: "Deletes a page group; its pages stay without a group.", Scope: full, Method: http.MethodDelete, Path: "/pages/groups/{id}/delete", PathParams: []Param{groupID}},
		{Name: "links_delete", Title: "Delete link", Description: "Deletes a link with its history. Cannot be undone.", Scope: full, Method: http.MethodDelete, Path: "/links/{id}/delete", PathParams: []Param{linkID}},
		{Name: "link_groups_delete", Title: "Delete link group", Description: "Deletes a link group; its links stay without a group.", Scope: full, Method: http.MethodDelete, Path: "/links/groups/{id}/delete", PathParams: []Param{groupID}},
		{Name: "kv_app_delete", Title: "Delete KV application", Description: "Deletes a KV application with all its data. Cannot be undone.", Scope: full, Method: http.MethodDelete, Path: "/apps/{id}/delete", PathParams: []Param{appID}},
		{Name: "kv_app_token_delete", Title: "Revoke KV token", Description: "Revokes a KV token.", Scope: full, Method: http.MethodDelete, Path: "/apps/{id}/tokens/{tokenId}/delete", PathParams: []Param{appID, {Name: "tokenId", Schema: text("Token id")}}},
		{Name: "kv_app_role_delete", Title: "Delete KV role", Description: "Deletes a role that no token uses.", Scope: full, Method: http.MethodDelete, Path: "/apps/{id}/roles/{role}/delete", PathParams: []Param{appID, {Name: "role", Schema: limitedText("Role name", 40)}}},
	}
}
