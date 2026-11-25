package rpc

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"pocketrun-api/internal/domains/mcp/utils/mcpdocs"
	"pocketrun-api/internal/domains/mcp/utils/mcptools"
	apikeyrepository "pocketrun-api/internal/repositories/apikey"
)

type Dependencies struct {
	Admin    http.Handler
	PagesURL string
	Logger   *slog.Logger
}

type Service struct {
	admin    http.Handler
	pagesURL string
	logger   *slog.Logger
}

func NewService(deps Dependencies) *Service {
	return &Service{admin: deps.Admin, pagesURL: strings.TrimRight(deps.PagesURL, "/"), logger: deps.Logger}
}

func (s *Service) Handle(ctx context.Context, scope apikeyrepository.Scope, message Message, source *http.Request) *Response {
	switch message.Method {
	case "initialize":
		return s.initialize(message)
	case "ping":
		return NewResult(message.ID, struct{}{})
	case "tools/list":
		return NewResult(message.ID, s.tools(scope))
	case "tools/call":
		return s.call(ctx, scope, message, source)
	default:
		return NewError(message.ID, MethodNotFound, "method not found: "+message.Method)
	}
}

func (s *Service) initialize(message Message) *Response {
	var params InitializeParams
	if len(message.Params) > 0 {
		if err := json.Unmarshal(message.Params, &params); err != nil {
			return NewError(message.ID, InvalidParams, "invalid initialize params")
		}
	}
	return NewResult(message.ID, InitializeResult{
		ProtocolVersion: NegotiateProtocol(params.ProtocolVersion),
		Capabilities:    Capabilities{Tools: ToolsCapability{ListChanged: false}},
		ServerInfo:      ServerInfo{Name: ServerName, Title: ServerTitle, Version: ServerVersion},
		Instructions:    Instructions,
	})
}

func (s *Service) tools(scope apikeyrepository.Scope) ToolsList {
	allowed := mcptools.Allowed(scope)
	descriptions := make([]ToolDescription, 0, len(allowed)+1)
	descriptions = append(descriptions, docsTool())
	for _, tool := range allowed {
		descriptions = append(descriptions, ToolDescription{
			Name:        tool.Name,
			Title:       tool.Title,
			Description: tool.Description,
			InputSchema: tool.InputSchema(),
			Annotations: tool.Annotations(),
		})
	}
	return ToolsList{Tools: descriptions}
}

func (s *Service) call(ctx context.Context, scope apikeyrepository.Scope, message Message, source *http.Request) *Response {
	var params CallParams
	if err := json.Unmarshal(message.Params, &params); err != nil || params.Name == "" {
		return NewError(message.ID, InvalidParams, "invalid tools/call params")
	}
	if params.Name == DocsToolName {
		return NewResult(message.ID, s.docs(params.Arguments, source))
	}

	tool, err := mcptools.Find(scope, params.Name)
	if errors.Is(err, mcptools.ErrUnknownTool) {
		return NewError(message.ID, InvalidParams, "unknown tool: "+params.Name)
	}

	request, err := tool.Request(params.Arguments)
	if err != nil {
		return NewResult(message.ID, NewTextResult("invalid arguments: "+err.Error(), true))
	}

	status, body, err := s.dispatch(ctx, request, source)
	if err != nil {
		s.logger.ErrorContext(ctx, "call mcp tool", "tool", tool.Name, "error", err)
		return NewError(message.ID, InternalError, "internal error")
	}
	return NewResult(message.ID, toolResult(status, body))
}

func (s *Service) dispatch(ctx context.Context, request mcptools.Request, source *http.Request) (int, []byte, error) {
	inner, err := http.NewRequestWithContext(ctx, request.Method, request.Target, bytes.NewReader(request.Body))
	if err != nil {
		return 0, nil, fmt.Errorf("build tool request %s %s: %w", request.Method, request.Target, err)
	}

	inner.Host = source.Host
	inner.RemoteAddr = source.RemoteAddr
	for _, name := range []string{"X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto", "X-Real-Ip", "User-Agent"} {
		if value := source.Header.Get(name); value != "" {
			inner.Header.Set(name, value)
		}
	}
	if request.Body != nil {
		inner.Header.Set("Content-Type", "application/json")
	}

	recorder := newRecorder()
	s.admin.ServeHTTP(recorder, inner)
	return recorder.status, recorder.body.Bytes(), nil
}

func (s *Service) docs(raw json.RawMessage, source *http.Request) CallResult {
	var args DocsArguments
	if len(raw) > 0 && string(raw) != "null" {
		if err := json.Unmarshal(raw, &args); err != nil {
			return NewTextResult("invalid arguments: "+err.Error(), true)
		}
	}
	text, err := mcpdocs.Text(args.Section, mcpdocs.Instance{APIURL: apiURL(source), PagesURL: s.pagesURL})
	if err != nil {
		return NewTextResult(err.Error()+"; sections: "+strings.Join(mcpdocs.Slugs(), ", "), true)
	}
	return NewTextResult(text, false)
}

func docsTool() ToolDescription {
	return ToolDescription{
		Name:        DocsToolName,
		Title:       DocsToolTitle,
		Description: DocsToolDescription,
		InputSchema: map[string]any{
			"type": "object",
			"properties": map[string]any{
				"section": map[string]any{"type": "string", "enum": mcpdocs.Slugs(), "description": "One section of the guide; leave it out to get the whole guide"},
			},
			"required":             []string{},
			"additionalProperties": false,
		},
		Annotations: map[string]any{"title": DocsToolTitle, "readOnlyHint": true, "destructiveHint": false, "idempotentHint": true, "openWorldHint": false},
	}
}

func apiURL(source *http.Request) string {
	scheme := "http"
	if source.TLS != nil || strings.EqualFold(source.Header.Get("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	host := source.Host
	if forwarded := source.Header.Get("X-Forwarded-Host"); forwarded != "" {
		host = strings.TrimSpace(strings.Split(forwarded, ",")[0])
	}
	return scheme + "://" + host
}

func toolResult(status int, body []byte) CallResult {
	isError := status >= http.StatusBadRequest
	text := string(bytes.TrimSpace(body))
	if text == "" {
		text = successfulReply
	}
	if isError {
		text = fmt.Sprintf("HTTP %d: %s", status, text)
	}
	return NewTextResult(text, isError)
}

type recorder struct {
	header      http.Header
	status      int
	body        bytes.Buffer
	wroteHeader bool
}

func newRecorder() *recorder {
	return &recorder{header: http.Header{}, status: http.StatusOK}
}

func (r *recorder) Header() http.Header {
	return r.header
}

func (r *recorder) WriteHeader(status int) {
	if r.wroteHeader {
		return
	}
	r.status = status
	r.wroteHeader = true
}

func (r *recorder) Write(content []byte) (int, error) {
	r.wroteHeader = true
	return r.body.Write(content)
}
