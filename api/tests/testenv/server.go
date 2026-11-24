package testenv

import (
	"context"
	"crypto/rand"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"pocketrun-api/internal/app"
	"pocketrun-api/internal/config"
	"pocketrun-api/internal/services/database"
)

const (
	defaultMongoURI = "mongodb://localhost:27017"
	connectTimeout  = 5 * time.Second
)

type Env struct {
	t        *testing.T
	URL      string
	client   *http.Client
	session  string
	password string
	Email    string
}

func Start(t *testing.T) *Env {
	t.Helper()

	db := connect(t)
	cfg := config.Config{
		CORSAllowedOrigins:      "*",
		AdminCORSAllowedOrigins: "http://panel.test",
		JWTSecret:               RandomText(32),
		PageAccessSecret:        RandomText(32),
	}

	handler, err := app.NewHandler(t.Context(), cfg, db, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatalf("build handler: %v", err)
	}

	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)

	return &Env{
		t:      t,
		URL:    server.URL,
		client: &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }},
	}
}

func connect(t *testing.T) *database.Mongo {
	t.Helper()

	uri := os.Getenv("TEST_MONGODB_URI")
	if uri == "" {
		uri = defaultMongoURI
	}

	ctx, cancel := context.WithTimeout(context.Background(), connectTimeout)
	defer cancel()

	db, err := database.Connect(ctx, uri, "pocketrun_test_"+RandomText(6))
	if err != nil {
		if os.Getenv("TEST_REQUIRE_MONGODB") == "true" {
			t.Fatalf("connect mongodb: %v", err)
		}
		t.Skipf("mongodb unavailable: %v", err)
	}

	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), connectTimeout)
		defer cancel()
		if err := db.Drop(ctx); err != nil {
			t.Errorf("drop test database: %v", err)
		}
		if err := db.Close(ctx); err != nil {
			t.Errorf("close test database: %v", err)
		}
	})
	return db
}

func RandomText(size int) string {
	var text strings.Builder
	for text.Len() < size {
		text.WriteString(rand.Text())
	}
	return strings.ToLower(text.String()[:size])
}
