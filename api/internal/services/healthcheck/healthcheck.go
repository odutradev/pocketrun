package healthcheck

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"
)

const (
	Command = "healthcheck"
	Path    = "/ping"
	Timeout = 3 * time.Second
)

func URL(host, port string) string {
	if ip := net.ParseIP(host); ip != nil && ip.IsUnspecified() {
		host = "127.0.0.1"
	}
	return "http://" + net.JoinHostPort(host, port) + Path
}

func Check(ctx context.Context, url string) error {
	ctx, cancel := context.WithTimeout(ctx, Timeout)
	defer cancel()

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return fmt.Errorf("request %s: %w", url, err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("request %s: status %d", url, response.StatusCode)
	}
	return nil
}
