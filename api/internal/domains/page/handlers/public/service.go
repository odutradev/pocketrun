package public

import (
	"log/slog"

	"github.com/go-playground/validator/v10"
)

type Dependencies struct {
	Pages    PageOpener
	Guard    AccessGuard
	Data     DataBridge
	PagesURL string
	Validate *validator.Validate
	Logger   *slog.Logger
}
