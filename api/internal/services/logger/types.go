package logger

import (
	"io"
	"log/slog"
	"sync"
)

const (
	colorReset   = "\x1b[0m"
	colorBold    = "\x1b[1m"
	colorDim     = "\x1b[90m"
	colorRed     = "\x1b[31m"
	colorYellow  = "\x1b[33m"
	colorBlue    = "\x1b[34m"
	colorMagenta = "\x1b[35m"
)

type Handler struct {
	out   io.Writer
	mu    *sync.Mutex
	color bool
	level slog.Level
	attrs []byte
	group string
}
