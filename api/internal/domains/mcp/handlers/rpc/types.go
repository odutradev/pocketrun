package rpc

import (
	"encoding/json"
	"errors"
)

const (
	JSONRPCVersion  = "2.0"
	LatestProtocol  = "2025-11-25"
	ServerName      = "pocketrun"
	ServerTitle     = "PocketRun"
	ServerVersion   = "1.0.0"
	MaxBodyBytes    = 4 << 20
	MaxBatchSize    = 20
	ParseError      = -32700
	InvalidRequest  = -32600
	MethodNotFound  = -32601
	InvalidParams   = -32602
	InternalError   = -32603
	Instructions    = "PocketRun hosts HTML pages, short links and KV data. Tools mirror the panel: pages_* manage pages (HTML, activation, PIN access, data), links_* manage short links, kv_* manage KV applications, roles and tokens. Read before you update: updates replace every field. The JSON config tools follow the formats in /llms.txt of the panel."
	successfulReply = "ok"
)

var ErrInvalidBatch = errors.New("invalid batch size")

type Message struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

func (m Message) IsNotification() bool {
	return len(m.ID) == 0
}

func (m Message) IsValid() bool {
	return m.JSONRPC == JSONRPCVersion && m.Method != "" && string(m.ID) != "null"
}

type Response struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Result  any             `json:"result,omitempty"`
	Error   *Error          `json:"error,omitempty"`
}

type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type InitializeParams struct {
	ProtocolVersion string `json:"protocolVersion"`
}

type InitializeResult struct {
	ProtocolVersion string       `json:"protocolVersion"`
	Capabilities    Capabilities `json:"capabilities"`
	ServerInfo      ServerInfo   `json:"serverInfo"`
	Instructions    string       `json:"instructions"`
}

type Capabilities struct {
	Tools ToolsCapability `json:"tools"`
}

type ToolsCapability struct {
	ListChanged bool `json:"listChanged"`
}

type ServerInfo struct {
	Name    string `json:"name"`
	Title   string `json:"title"`
	Version string `json:"version"`
}

type ToolDescription struct {
	Name        string         `json:"name"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"inputSchema"`
	Annotations map[string]any `json:"annotations"`
}

type ToolsList struct {
	Tools []ToolDescription `json:"tools"`
}

type CallParams struct {
	Name      string          `json:"name"`
	Arguments json.RawMessage `json:"arguments"`
}

type CallResult struct {
	Content []Content `json:"content"`
	IsError bool      `json:"isError"`
}

type Content struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

func NewTextResult(text string, isError bool) CallResult {
	return CallResult{Content: []Content{{Type: "text", Text: text}}, IsError: isError}
}

func NewResult(id json.RawMessage, result any) *Response {
	return &Response{JSONRPC: JSONRPCVersion, ID: id, Result: result}
}

func NewError(id json.RawMessage, code int, message string) *Response {
	if len(id) == 0 {
		id = json.RawMessage("null")
	}
	return &Response{JSONRPC: JSONRPCVersion, ID: id, Error: &Error{Code: code, Message: message}}
}

func NegotiateProtocol(requested string) string {
	switch requested {
	case "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05":
		return requested
	default:
		return LatestProtocol
	}
}
