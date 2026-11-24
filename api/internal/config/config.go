package config

import (
	"bufio"
	"errors"
	"fmt"
	"net"
	"net/url"
	"os"
	"slices"
	"strconv"
	"strings"
)

const (
	minSecretLength    = 32
	maxMongoNameLength = 63
	mongoNameForbidden = `/\. "$*<>:|?`
)

var ErrInvalidEnv = errors.New("invalid environment variable")

type Config struct {
	Host                    string
	Port                    string
	CORSAllowedOrigins      string
	AdminCORSAllowedOrigins string
	MongoURI                string
	MongoName               string
	JWTSecret               string
	PageAccessSecret        string
	LinksURL                string
	AllowHTTP               string
}

func Load() (Config, error) {
	for _, path := range []string{".env", "../.env"} {
		if err := loadFile(path); err != nil {
			return Config{}, fmt.Errorf("load env file %s: %w", path, err)
		}
	}

	cfg := Config{
		Host:                    read("HOST"),
		Port:                    read("PORT"),
		CORSAllowedOrigins:      read("CORS_ALLOWED_ORIGINS"),
		AdminCORSAllowedOrigins: read("ADMIN_CORS_ALLOWED_ORIGINS"),
		MongoURI:                read("MONGODB_URI"),
		MongoName:               read("MONGODB_NAME"),
		JWTSecret:               read("JWT_SECRET"),
		PageAccessSecret:        read("PAGE_ACCESS_SECRET"),
		LinksURL:                read("LINKS_URL"),
		AllowHTTP:               read("ALLOW_HTTP"),
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Validate() error {
	return errors.Join(
		checkHost("HOST", c.Host),
		checkPort("PORT", c.Port),
		checkOrigins("CORS_ALLOWED_ORIGINS", c.CORSAllowedOrigins, true),
		checkOrigins("ADMIN_CORS_ALLOWED_ORIGINS", c.AdminCORSAllowedOrigins, false),
		checkMongoURI("MONGODB_URI", c.MongoURI),
		checkMongoName("MONGODB_NAME", c.MongoName),
		checkSecret("JWT_SECRET", c.JWTSecret),
		checkSecret("PAGE_ACCESS_SECRET", c.PageAccessSecret),
		checkDistinctSecrets(c.JWTSecret, c.PageAccessSecret),
		checkOrigin("LINKS_URL", c.LinksURL),
		checkBool("ALLOW_HTTP", c.AllowHTTP),
	)
}

func (c Config) AllowsHTTP() bool {
	return c.AllowHTTP == "true"
}

func invalid(key, reason string) error {
	return fmt.Errorf("%w: %s %s", ErrInvalidEnv, key, reason)
}

func checkHost(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	if value != "localhost" && net.ParseIP(value) == nil {
		return invalid(key, "must be an IP address or localhost")
	}
	return nil
}

func checkPort(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	port, err := strconv.Atoi(value)
	if err != nil || port < 1 || port > 65535 {
		return invalid(key, "must be a number from 1 to 65535")
	}
	return nil
}

func checkOrigins(key, value string, allowsAny bool) error {
	if value == "" {
		return invalid(key, "is required")
	}
	origins := strings.Split(value, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}
	if slices.Contains(origins, "*") {
		if !allowsAny {
			return invalid(key, "cannot be *, because the panel signs in with a cookie")
		}
		if len(origins) > 1 {
			return invalid(key, "must be * alone or a list of origins")
		}
		return nil
	}
	for _, origin := range origins {
		if err := checkOrigin(key, origin); err != nil {
			return err
		}
	}
	return nil
}

func checkOrigin(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	parsed, err := url.Parse(value)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return invalid(key, "must be an http or https URL")
	}
	if strings.TrimSuffix(parsed.Path, "/") != "" || parsed.RawQuery != "" || parsed.Fragment != "" || parsed.User != nil {
		return invalid(key, "must hold only the scheme and the host")
	}
	return nil
}

func checkBool(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	if value != "true" && value != "false" {
		return invalid(key, "must be true or false")
	}
	return nil
}

func checkMongoURI(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	scheme, rest, found := strings.Cut(value, "://")
	if !found || (scheme != "mongodb" && scheme != "mongodb+srv") || strings.Trim(rest, "/") == "" {
		return invalid(key, "must be a mongodb:// or mongodb+srv:// URI")
	}
	return nil
}

func checkMongoName(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	if len(value) > maxMongoNameLength || strings.ContainsAny(value, mongoNameForbidden) {
		return invalid(key, fmt.Sprintf("must have up to %d characters and none of %s", maxMongoNameLength, mongoNameForbidden))
	}
	return nil
}

func checkSecret(key, value string) error {
	if value == "" {
		return invalid(key, "is required")
	}
	if len(value) < minSecretLength {
		return invalid(key, fmt.Sprintf("must have at least %d characters", minSecretLength))
	}
	return nil
}

func checkDistinctSecrets(jwtSecret, pageAccessSecret string) error {
	if jwtSecret != "" && jwtSecret == pageAccessSecret {
		return invalid("PAGE_ACCESS_SECRET", "must differ from JWT_SECRET")
	}
	return nil
}

func read(key string) string {
	return strings.TrimSpace(os.Getenv(key))
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
