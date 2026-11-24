package unit

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"pocketrun-api/internal/services/healthcheck"
)

func TestHealthcheckURL(t *testing.T) {
	tests := []struct {
		name string
		host string
		port string
		want string
	}{
		{name: "any ipv4 interface uses loopback", host: "0.0.0.0", port: "80", want: "http://127.0.0.1:80/ping"},
		{name: "any ipv6 interface uses loopback", host: "::", port: "80", want: "http://127.0.0.1:80/ping"},
		{name: "loopback stays", host: "127.0.0.1", port: "5000", want: "http://127.0.0.1:5000/ping"},
		{name: "localhost stays", host: "localhost", port: "5000", want: "http://localhost:5000/ping"},
		{name: "specific ipv6 is bracketed", host: "::1", port: "80", want: "http://[::1]:80/ping"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := healthcheck.URL(tt.host, tt.port); got != tt.want {
				t.Fatalf("URL(%q, %q) = %q, want %q", tt.host, tt.port, got, tt.want)
			}
		})
	}
}

func TestHealthcheckCheck(t *testing.T) {
	tests := []struct {
		name    string
		status  int
		wantErr bool
	}{
		{name: "healthy api passes", status: http.StatusOK},
		{name: "error status fails", status: http.StatusServiceUnavailable, wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.status)
			}))
			defer server.Close()

			err := healthcheck.Check(t.Context(), server.URL+healthcheck.Path)
			if (err != nil) != tt.wantErr {
				t.Fatalf("error %v, want error %v", err, tt.wantErr)
			}
		})
	}

	t.Run("stopped api fails", func(t *testing.T) {
		server := httptest.NewServer(http.NotFoundHandler())
		url := server.URL + healthcheck.Path
		server.Close()
		if err := healthcheck.Check(t.Context(), url); err == nil {
			t.Fatal("expected an error for a stopped api")
		}
	})
}
