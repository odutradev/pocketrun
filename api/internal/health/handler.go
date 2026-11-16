package health

import (
	"net/http"

	"pocketrun-api/internal/platform/httpx"
)

type PingResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /ping", h.ping)
}

func (h *Handler) ping(w http.ResponseWriter, r *http.Request) {
	httpx.WriteJSON(w, http.StatusOK, PingResponse{Status: "success", Message: "pong"})
}
