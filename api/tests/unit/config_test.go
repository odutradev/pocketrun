package unit

import (
	"errors"
	"strings"
	"testing"

	"pocketrun-api/internal/config"
)

func validConfig() config.Config {
	return config.Config{
		Host:                    "0.0.0.0",
		Port:                    "80",
		CORSAllowedOrigins:      "*",
		AdminCORSAllowedOrigins: "https://pocketrun.com",
		MongoURI:                "mongodb://mongo:27017",
		MongoName:               "pocketrun",
		JWTSecret:               strings.Repeat("a", 32),
		PageAccessSecret:        strings.Repeat("b", 32),
		LinksURL:                "https://link.pocketrun.com",
	}
}

func TestConfigValidate(t *testing.T) {
	tests := []struct {
		name    string
		change  func(*config.Config)
		wantKey string
	}{
		{name: "accepts a complete config", change: func(*config.Config) {}},
		{name: "accepts localhost and a list of admin origins", change: func(c *config.Config) {
			c.Host = "localhost"
			c.AdminCORSAllowedOrigins = "https://pocketrun.com, http://localhost:3000"
		}},
		{name: "accepts an atlas uri", change: func(c *config.Config) { c.MongoURI = "mongodb+srv://user:pass@cluster0.mongodb.net/?retryWrites=true" }},
		{name: "rejects an empty host", change: func(c *config.Config) { c.Host = "" }, wantKey: "HOST"},
		{name: "rejects a host that is not an address", change: func(c *config.Config) { c.Host = "everywhere" }, wantKey: "HOST"},
		{name: "rejects an empty port", change: func(c *config.Config) { c.Port = "" }, wantKey: "PORT"},
		{name: "rejects a port out of range", change: func(c *config.Config) { c.Port = "70000" }, wantKey: "PORT"},
		{name: "rejects empty public origins", change: func(c *config.Config) { c.CORSAllowedOrigins = "" }, wantKey: "CORS_ALLOWED_ORIGINS"},
		{name: "rejects any origin mixed with a list", change: func(c *config.Config) { c.CORSAllowedOrigins = "*,https://a.com" }, wantKey: "CORS_ALLOWED_ORIGINS"},
		{name: "rejects any origin for the panel", change: func(c *config.Config) { c.AdminCORSAllowedOrigins = "*" }, wantKey: "ADMIN_CORS_ALLOWED_ORIGINS"},
		{name: "rejects a panel origin with a path", change: func(c *config.Config) { c.AdminCORSAllowedOrigins = "https://pocketrun.com/app" }, wantKey: "ADMIN_CORS_ALLOWED_ORIGINS"},
		{name: "rejects an empty mongodb uri", change: func(c *config.Config) { c.MongoURI = "" }, wantKey: "MONGODB_URI"},
		{name: "rejects a uri of another scheme", change: func(c *config.Config) { c.MongoURI = "postgres://db:5432" }, wantKey: "MONGODB_URI"},
		{name: "rejects an empty database name", change: func(c *config.Config) { c.MongoName = "" }, wantKey: "MONGODB_NAME"},
		{name: "rejects a database name with a dot", change: func(c *config.Config) { c.MongoName = "pocket.run" }, wantKey: "MONGODB_NAME"},
		{name: "rejects an empty jwt secret", change: func(c *config.Config) { c.JWTSecret = "" }, wantKey: "JWT_SECRET"},
		{name: "rejects a short jwt secret", change: func(c *config.Config) { c.JWTSecret = "curta" }, wantKey: "JWT_SECRET"},
		{name: "rejects the old default jwt secret", change: func(c *config.Config) { c.JWTSecret = "pocketrun-secret-key-change-in-production" }, wantKey: "JWT_SECRET"},
		{name: "rejects an empty page access secret", change: func(c *config.Config) { c.PageAccessSecret = "" }, wantKey: "PAGE_ACCESS_SECRET"},
		{name: "rejects an example page access secret", change: func(c *config.Config) { c.PageAccessSecret = "troque_por_outra_chave_longa_e_aleatoria" }, wantKey: "PAGE_ACCESS_SECRET"},
		{name: "rejects equal secrets", change: func(c *config.Config) { c.PageAccessSecret = c.JWTSecret }, wantKey: "PAGE_ACCESS_SECRET"},
		{name: "rejects an empty links url", change: func(c *config.Config) { c.LinksURL = "" }, wantKey: "LINKS_URL"},
		{name: "rejects a links url without scheme", change: func(c *config.Config) { c.LinksURL = "link.pocketrun.com" }, wantKey: "LINKS_URL"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg := validConfig()
			tt.change(&cfg)
			err := cfg.Validate()
			if tt.wantKey == "" {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				return
			}
			if !errors.Is(err, config.ErrInvalidEnv) || !strings.Contains(err.Error(), tt.wantKey+" ") {
				t.Fatalf("error %v, want one about %s", err, tt.wantKey)
			}
		})
	}
}

func TestConfigValidateReportsEveryProblem(t *testing.T) {
	err := config.Config{}.Validate()
	keys := []string{"HOST", "PORT", "CORS_ALLOWED_ORIGINS", "ADMIN_CORS_ALLOWED_ORIGINS", "MONGODB_URI", "MONGODB_NAME", "JWT_SECRET", "PAGE_ACCESS_SECRET", "LINKS_URL"}
	for _, key := range keys {
		if !strings.Contains(err.Error(), key+" is required") {
			t.Errorf("missing %s in %v", key, err)
		}
	}
}

func TestConfigErrorsHideSecrets(t *testing.T) {
	cfg := validConfig()
	cfg.JWTSecret = "segredo-curto"
	if err := cfg.Validate(); err == nil || strings.Contains(err.Error(), cfg.JWTSecret) {
		t.Fatalf("error must exist and hide the value: %v", err)
	}
}
