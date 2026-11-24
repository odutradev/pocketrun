package httpx

import (
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type Router struct {
	Admin        *http.ServeMux
	Public       *http.ServeMux
	Authenticate func(http.Handler) http.Handler
	Validate     *validator.Validate
	Logger       *slog.Logger
}
