package logger

import (
	"bytes"
	"errors"
	"log/slog"
	"strings"
	"testing"
)

func TestHandlerHandle(t *testing.T) {
	tests := []struct {
		name    string
		color   bool
		write   func(log *slog.Logger)
		want    []string
		notWant []string
	}{
		{
			name:  "formats level message and attributes",
			color: false,
			write: func(log *slog.Logger) {
				log.With("service", "api").WithGroup("db").Warn("database connected", "name", "pocketrun", "error", errors.New("slow ping"))
			},
			want:    []string{"WARN  database connected", "service=api", "db.name=pocketrun", `db.error="slow ping"`},
			notWant: []string{"\x1b["},
		},
		{
			name:  "colors the level",
			color: true,
			write: func(log *slog.Logger) {
				log.Error("run api")
			},
			want: []string{colorRed + "ERROR" + colorReset, colorBold + "run api" + colorReset},
		},
		{
			name:  "skips debug",
			color: false,
			write: func(log *slog.Logger) {
				log.Debug("hidden")
			},
			notWant: []string{"hidden"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var out bytes.Buffer
			tt.write(slog.New(NewHandler(&out, tt.color)))
			line := out.String()
			for _, want := range tt.want {
				if !strings.Contains(line, want) {
					t.Fatalf("line %q does not contain %q", line, want)
				}
			}
			for _, notWant := range tt.notWant {
				if strings.Contains(line, notWant) {
					t.Fatalf("line %q contains %q", line, notWant)
				}
			}
		})
	}
}
