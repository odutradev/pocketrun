package testenv

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"pocketrun-api/internal/domains/user/utils/sessioncookie"
)

const (
	PanelHeader     = "X-Pocketrun-Client"
	PanelClient     = "panel"
	SessionCookie   = sessioncookie.SecureName
	PageDataHeader  = "X-Pocketrun-Page"
	ClientIPHeader  = "X-Forwarded-For"
	UserAgentHeader = "User-Agent"
	BrowserAgent    = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PocketRunTest/1.0"
)

type Response struct {
	Status int
	Header http.Header
	Body   []byte
}

type Request struct {
	Method  string
	Path    string
	Body    any
	Headers map[string]string
	Panel   bool
}

func (e *Env) Do(request Request) Response {
	e.t.Helper()

	var body io.Reader
	if request.Body != nil {
		encoded, err := json.Marshal(request.Body)
		if err != nil {
			e.t.Fatalf("encode body: %v", err)
		}
		body = bytes.NewReader(encoded)
	}

	httpRequest, err := http.NewRequestWithContext(e.t.Context(), request.Method, e.URL+request.Path, body)
	if err != nil {
		e.t.Fatalf("build request: %v", err)
	}
	if request.Body != nil {
		httpRequest.Header.Set("Content-Type", "application/json")
	}
	httpRequest.Header.Set(UserAgentHeader, BrowserAgent)
	if request.Panel {
		httpRequest.Header.Set(PanelHeader, PanelClient)
		if e.session != "" {
			httpRequest.AddCookie(&http.Cookie{Name: SessionCookie, Value: e.session})
		}
	}
	for name, value := range request.Headers {
		httpRequest.Header.Set(name, value)
	}

	response, err := e.client.Do(httpRequest)
	if err != nil {
		e.t.Fatalf("%s %s: %v", request.Method, request.Path, err)
	}
	defer response.Body.Close()

	content, err := io.ReadAll(response.Body)
	if err != nil {
		e.t.Fatalf("read response: %v", err)
	}
	for _, cookie := range response.Cookies() {
		if cookie.Name == SessionCookie && request.Panel {
			e.session = cookie.Value
		}
	}
	return Response{Status: response.StatusCode, Header: response.Header, Body: content}
}

func (e *Env) Admin(method, path string, body any) Response {
	e.t.Helper()
	return e.Do(Request{Method: method, Path: "/admin" + path, Body: body, Panel: true})
}

func (e *Env) KV(token, method, path string, body any) Response {
	e.t.Helper()
	return e.Do(Request{Method: method, Path: path, Body: body, Headers: map[string]string{"Authorization": "Bearer " + token}})
}

func (r Response) Decode(t interface {
	Helper()
	Fatalf(string, ...any)
}, target any) {
	t.Helper()
	if err := json.Unmarshal(r.Body, target); err != nil {
		t.Fatalf("decode %q: %v", r.Body, err)
	}
}

func (r Response) Code() string {
	var payload struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(r.Body, &payload); err != nil {
		return ""
	}
	return payload.Error
}

func (r Response) Contains(text string) bool {
	return strings.Contains(string(r.Body), text)
}

func (e *Env) Expect(response Response, status int, label string) {
	e.t.Helper()
	if response.Status != status {
		e.t.Fatalf("%s: status %d, want %d, body %s", label, response.Status, status, response.Body)
	}
}
