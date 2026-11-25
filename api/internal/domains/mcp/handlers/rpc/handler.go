package rpc

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"pocketrun-api/internal/domains/mcp/middlewares/apikeyauth"
	"pocketrun-api/internal/services/httpx"
)

type Handler struct {
	service *Service
	logger  *slog.Logger
}

func NewHandler(service *Service, logger *slog.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("POST /mcp", authenticate(http.HandlerFunc(h.post)))
	mux.HandleFunc("GET /mcp", h.notAllowed)
	mux.HandleFunc("DELETE /mcp", h.notAllowed)
}

func (h *Handler) notAllowed(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Allow", http.MethodPost)
	httpx.WriteError(w, http.StatusMethodNotAllowed, "method_not_allowed")
}

func (h *Handler) post(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	scope, ok := apikeyauth.ScopeFromContext(ctx)
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	payload, err := io.ReadAll(http.MaxBytesReader(w, r.Body, MaxBodyBytes))
	if err != nil {
		httpx.WriteJSON(w, http.StatusRequestEntityTooLarge, NewError(nil, InvalidRequest, "request too large"))
		return
	}

	messages, isBatch, err := decodeMessages(payload)
	if err != nil {
		httpx.WriteJSON(w, http.StatusBadRequest, NewError(nil, ParseError, "parse error"))
		return
	}

	responses := []*Response{}
	for _, message := range messages {
		if !message.IsValid() {
			if !message.IsNotification() {
				responses = append(responses, NewError(message.ID, InvalidRequest, "invalid request"))
			}
			continue
		}
		if message.IsNotification() {
			continue
		}
		responses = append(responses, h.service.Handle(ctx, scope, message, r))
	}

	if len(responses) == 0 {
		w.WriteHeader(http.StatusAccepted)
		return
	}
	if !isBatch {
		httpx.WriteJSON(w, http.StatusOK, responses[0])
		return
	}
	httpx.WriteJSON(w, http.StatusOK, responses)
}

func decodeMessages(payload []byte) ([]Message, bool, error) {
	trimmed := bytes.TrimSpace(payload)
	if len(trimmed) > 0 && trimmed[0] == '[' {
		var messages []Message
		if err := json.Unmarshal(trimmed, &messages); err != nil {
			return nil, true, err
		}
		if len(messages) == 0 || len(messages) > MaxBatchSize {
			return nil, true, ErrInvalidBatch
		}
		return messages, true, nil
	}

	var message Message
	if err := json.Unmarshal(trimmed, &message); err != nil {
		return nil, false, err
	}
	return []Message{message}, false, nil
}
