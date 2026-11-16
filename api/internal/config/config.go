package config

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strings"
)

const (
	ModeAll    = "all"
	ModePublic = "public"
	ModeAdmin  = "admin"
)

var ErrInvalidAPIMode = errors.New("invalid api mode")

type Config struct {
	APIMode                 string
	PublicPort              string
	AdminPort               string
	CORSAllowedOrigins      string
	AdminCORSAllowedOrigins string
	MongoURI                string
	MongoName               string
	JWTSecret               string
}

func Load() (Config, error) {
	for _, path := range []string{".env", "../.env"} {
		if err := loadFile(path); err != nil {
			return Config{}, fmt.Errorf("load env file %s: %w", path, err)
		}
	}

	corsAllowedOrigins := lookup("CORS_ALLOWED_ORIGINS", "*")
	cfg := Config{
		APIMode:                 strings.ToLower(lookup("API_MODE", ModeAll)),
		PublicPort:              lookup("PUBLIC_PORT", lookup("PORT", "8080")),
		AdminPort:               lookup("ADMIN_PORT", "8081"),
		CORSAllowedOrigins:      corsAllowedOrigins,
		AdminCORSAllowedOrigins: lookup("ADMIN_CORS_ALLOWED_ORIGINS", corsAllowedOrigins),
		MongoURI:                lookup("MONGODB_URI", "mongodb://localhost:27017"),
		MongoName:               lookup("MONGODB_NAME", "pocketrun"),
		JWTSecret:               lookup("JWT_SECRET", "pocketrun-secret-key-change-in-production"),
	}

	if cfg.APIMode != ModeAll && cfg.APIMode != ModePublic && cfg.APIMode != ModeAdmin {
		return Config{}, fmt.Errorf("api mode %q: %w", cfg.APIMode, ErrInvalidAPIMode)
	}
	return cfg, nil
}

func (c Config) ServesPublic() bool {
	return c.APIMode == ModeAll || c.APIMode == ModePublic
}

func (c Config) ServesAdmin() bool {
	return c.APIMode == ModeAll || c.APIMode == ModeAdmin
}

func lookup(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func loadFile(path string) error {
	file, err := os.Open(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}

		key = strings.TrimSpace(key)
		if os.Getenv(key) != "" {
			continue
		}

		if err := os.Setenv(key, strings.Trim(strings.TrimSpace(value), `"'`)); err != nil {
			return fmt.Errorf("set %s: %w", key, err)
		}
	}
	return scanner.Err()
}
