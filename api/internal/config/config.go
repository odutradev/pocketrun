package config

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Host                    string
	Port                    string
	CORSAllowedOrigins      string
	AdminCORSAllowedOrigins string
	MongoURI                string
	MongoName               string
	JWTSecret               string
	LinksURL                string
}

func Load() (Config, error) {
	for _, path := range []string{".env", "../.env"} {
		if err := loadFile(path); err != nil {
			return Config{}, fmt.Errorf("load env file %s: %w", path, err)
		}
	}

	corsAllowedOrigins := lookup("CORS_ALLOWED_ORIGINS", "*")
	cfg := Config{
		Host:                    lookup("HOST", ""),
		Port:                    lookup("PORT", "8080"),
		CORSAllowedOrigins:      corsAllowedOrigins,
		AdminCORSAllowedOrigins: lookup("ADMIN_CORS_ALLOWED_ORIGINS", corsAllowedOrigins),
		MongoURI:                lookup("MONGODB_URI", "mongodb://localhost:27017"),
		MongoName:               lookup("MONGODB_NAME", "pocketrun"),
		JWTSecret:               lookup("JWT_SECRET", "pocketrun-secret-key-change-in-production"),
		LinksURL:                lookup("LINKS_URL", ""),
	}
	return cfg, nil
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
		return fmt.Errorf("open %s: %w", path, err)
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
