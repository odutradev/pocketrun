package logger

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"
)

func New(w io.Writer) *slog.Logger {
	_, noColor := os.LookupEnv("NO_COLOR")
	return slog.New(NewHandler(w, !noColor))
}

func NewHandler(w io.Writer, color bool) *Handler {
	return &Handler{out: w, mu: &sync.Mutex{}, color: color, level: slog.LevelInfo}
}

func (h *Handler) Enabled(_ context.Context, level slog.Level) bool {
	return level >= h.level
}

func (h *Handler) Handle(_ context.Context, record slog.Record) error {
	var buf bytes.Buffer
	h.paint(&buf, colorDim, record.Time.Format(time.TimeOnly))
	buf.WriteByte(' ')
	name, tone := levelStyle(record.Level)
	h.paint(&buf, tone, name)
	buf.WriteByte(' ')
	h.paint(&buf, colorBold, record.Message)
	buf.Write(h.attrs)
	record.Attrs(func(attr slog.Attr) bool {
		h.appendAttr(&buf, h.group, attr)
		return true
	})
	buf.WriteByte('\n')

	h.mu.Lock()
	defer h.mu.Unlock()
	_, err := h.out.Write(buf.Bytes())
	return err
}

func (h *Handler) WithAttrs(attrs []slog.Attr) slog.Handler {
	var buf bytes.Buffer
	buf.Write(h.attrs)
	for _, attr := range attrs {
		h.appendAttr(&buf, h.group, attr)
	}
	next := *h
	next.attrs = buf.Bytes()
	return &next
}

func (h *Handler) WithGroup(name string) slog.Handler {
	if name == "" {
		return h
	}
	next := *h
	next.group = h.group + name + "."
	return &next
}

func (h *Handler) appendAttr(buf *bytes.Buffer, prefix string, attr slog.Attr) {
	attr.Value = attr.Value.Resolve()
	if attr.Equal(slog.Attr{}) {
		return
	}
	if attr.Value.Kind() == slog.KindGroup {
		group := prefix
		if attr.Key != "" {
			group += attr.Key + "."
		}
		for _, child := range attr.Value.Group() {
			h.appendAttr(buf, group, child)
		}
		return
	}

	buf.WriteString("  ")
	keyTone := colorDim
	if attr.Key == "error" || attr.Key == "err" {
		keyTone = colorRed
	}
	h.paint(buf, keyTone, prefix+attr.Key+"=")
	buf.WriteString(formatValue(attr.Value))
}

func (h *Handler) paint(buf *bytes.Buffer, tone, text string) {
	if !h.color {
		buf.WriteString(text)
		return
	}
	buf.WriteString(tone)
	buf.WriteString(text)
	buf.WriteString(colorReset)
}

func levelStyle(level slog.Level) (string, string) {
	switch {
	case level >= slog.LevelError:
		return "ERROR", colorRed
	case level >= slog.LevelWarn:
		return "WARN ", colorYellow
	case level >= slog.LevelInfo:
		return "INFO ", colorBlue
	default:
		return "DEBUG", colorMagenta
	}
}

func formatValue(value slog.Value) string {
	var text string
	switch value.Kind() {
	case slog.KindTime:
		text = value.Time().Format(time.RFC3339)
	case slog.KindDuration:
		text = value.Duration().String()
	default:
		text = value.String()
	}
	if needsQuote(text) {
		return strconv.Quote(text)
	}
	return text
}

func needsQuote(text string) bool {
	if text == "" {
		return true
	}
	return strings.IndexFunc(text, func(r rune) bool {
		return unicode.IsSpace(r) || r == '"' || r == '=' || !unicode.IsPrint(r)
	}) >= 0
}
