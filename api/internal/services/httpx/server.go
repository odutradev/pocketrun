package httpx

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"time"
)

const ShutdownTimeout = 10 * time.Second

func NewServer(host, port string, handler http.Handler) *http.Server {
	return &http.Server{
		Addr:              net.JoinHostPort(host, port),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
}

func Serve(ctx context.Context, logger *slog.Logger, servers []*http.Server) error {
	listenErrors := make(chan error, len(servers))
	for _, server := range servers {
		go func() {
			logger.InfoContext(ctx, "server listening", "addr", server.Addr)
			if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
				listenErrors <- fmt.Errorf("listen %s: %w", server.Addr, err)
			}
		}()
	}

	var listenError error
	select {
	case <-ctx.Done():
	case listenError = <-listenErrors:
	}

	shutdownContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), ShutdownTimeout)
	defer cancel()

	shutdownErrors := []error{listenError}
	for _, server := range servers {
		if err := server.Shutdown(shutdownContext); err != nil {
			shutdownErrors = append(shutdownErrors, fmt.Errorf("shutdown %s: %w", server.Addr, err))
		}
	}
	logger.InfoContext(shutdownContext, "servers stopped")
	return errors.Join(shutdownErrors...)
}
