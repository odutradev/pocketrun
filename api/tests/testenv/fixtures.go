package testenv

import (
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type App struct {
	ID        string
	ProjectID string
	Token     string
}

type Rule struct {
	Collection   string   `json:"collection"`
	Operations   []string `json:"operations"`
	MaxDocuments int      `json:"maxDocuments,omitempty"`
}

type Item struct {
	ID   string `json:"id"`
	Slug string `json:"slug"`
}

func (e *Env) Setup() {
	e.t.Helper()

	e.Email = "admin-" + RandomText(4) + "@pocketrun.test"
	e.password = "Senha-" + RandomText(8)
	response := e.Admin(http.MethodPost, "/setup/admin/create", map[string]string{"name": "Admin Teste", "email": e.Email, "password": e.password, "setupToken": e.SetupToken()})
	e.Expect(response, http.StatusCreated, "create admin")
	if e.session == "" {
		e.t.Fatal("setup did not return a session cookie")
	}
}

func (e *Env) Login(email, password string, headers map[string]string) Response {
	e.t.Helper()
	return e.Do(Request{Method: http.MethodPost, Path: "/admin/auth/login", Body: map[string]string{"email": email, "password": password}, Headers: headers, Panel: true})
}

func (e *Env) Password() string {
	return e.password
}

func (e *Env) CreateApp(name string) App {
	e.t.Helper()

	projectID := "project-" + RandomText(4)
	response := e.Admin(http.MethodPost, "/apps/create", map[string]any{"name": name, "projectId": projectID, "allowedOrigins": []string{"*"}})
	e.Expect(response, http.StatusCreated, "create app")

	var created struct {
		Application struct {
			ID string `json:"id"`
		} `json:"application"`
		RawToken string `json:"rawToken"`
	}
	response.Decode(e.t, &created)
	return App{ID: created.Application.ID, ProjectID: projectID, Token: created.RawToken}
}

func (e *Env) CreateRole(app App, name string, isOwnDocumentsOnly bool, rules ...Rule) {
	e.t.Helper()

	response := e.Admin(http.MethodPost, "/apps/"+app.ID+"/roles/create", map[string]any{"name": name, "rules": rules, "isOwnDocumentsOnly": isOwnDocumentsOnly})
	e.Expect(response, http.StatusCreated, "create role "+name)
}

func (e *Env) CreateToken(app App, role string) string {
	e.t.Helper()

	response := e.Admin(http.MethodPost, "/apps/"+app.ID+"/tokens/create", map[string]any{"name": "token " + role, "validityDays": 30, "role": role})
	e.Expect(response, http.StatusCreated, "create token "+role)

	var created struct {
		RawToken string `json:"rawToken"`
	}
	response.Decode(e.t, &created)
	return created.RawToken
}

func (e *Env) CreateLink(input map[string]any) Item {
	e.t.Helper()
	return e.createItem("/links/create", input)
}

func (e *Env) CreatePage(input map[string]any) Item {
	e.t.Helper()
	return e.createItem("/pages/create", input)
}

func (e *Env) createItem(path string, input map[string]any) Item {
	e.t.Helper()

	if _, ok := input["slug"]; !ok {
		input["slug"] = "t-" + RandomText(4)
	}
	if _, ok := input["mode"]; !ok {
		input["mode"] = "active"
	}
	response := e.Admin(http.MethodPost, path, input)
	e.Expect(response, http.StatusCreated, "create "+path)

	var item Item
	response.Decode(e.t, &item)
	return item
}

func (e *Env) Visit(slug, ip, userAgent string) Response {
	e.t.Helper()
	return e.Do(Request{Method: http.MethodGet, Path: "/" + slug, Headers: map[string]string{ClientIPHeader: ip, UserAgentHeader: userAgent}})
}

func (e *Env) PageData(slug, method, path string, body any, ip string) Response {
	e.t.Helper()
	return e.Do(Request{Method: method, Path: "/" + slug + "/_/kv/" + path, Body: body, Headers: map[string]string{PageDataHeader: "1", ClientIPHeader: ip}})
}

func Later(duration time.Duration) time.Time {
	return time.Now().Add(duration).UTC()
}

func (e *Env) UnlockPage(slug, pin, ip string) Response {
	e.t.Helper()

	form := url.Values{"pin": {pin}}
	request, err := http.NewRequestWithContext(e.t.Context(), http.MethodPost, e.URL+"/"+slug, strings.NewReader(form.Encode()))
	if err != nil {
		e.t.Fatalf("build unlock request: %v", err)
	}
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set(UserAgentHeader, BrowserAgent)
	request.Header.Set(ClientIPHeader, ip)

	response, err := e.client.Do(request)
	if err != nil {
		e.t.Fatalf("unlock %s: %v", slug, err)
	}
	defer response.Body.Close()

	content, err := io.ReadAll(response.Body)
	if err != nil {
		e.t.Fatalf("read unlock response: %v", err)
	}
	return Response{Status: response.StatusCode, Header: response.Header, Body: content}
}
