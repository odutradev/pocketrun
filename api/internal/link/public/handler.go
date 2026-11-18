package link

import (
	"net/http"

	"pocketrun-api/internal/platform/httpx"
)

const (
	unavailableHeading = "Link indisponível"
	unavailableMessage = "Este endereço não existe, foi desativado ou já expirou. Confira o link com quem o enviou."
)

func (h *Handler) writeNotFoundPage(w http.ResponseWriter, r *http.Request) {
	if err := httpx.WriteUnavailablePage(w, unavailableHeading, unavailableMessage); err != nil {
		h.logger.WarnContext(r.Context(), "write not found page", "error", err)
	}
}
