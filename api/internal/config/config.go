package config

import (
	"bufio"
	"os"
	"strings"
	"sync"
)

var envOnce sync.Once

type Config struct {
	AdminPort      string
	PublicPort     string
	APIMode        string
	Env            string
	AllowedOrigins string
	AdminOrigins   string
	MongoURI       string
	MongoDBName    string
	JWTSecret      string
}

func Load() *Config {
	ensureEnvLoaded()

	adminPort := GetEnv("ADMIN_PORT", "8081")
	publicPort := GetEnv("PUBLIC_PORT", GetEnv("PORT", "8080"))
	apiMode := strings.ToLower(GetEnv("API_MODE", "all"))
	env := GetEnv("ENV", "development")
	allowedOrigins := GetEnv("CORS_ALLOWED_ORIGINS", "*")
	adminOrigins := GetEnv("ADMIN_CORS_ALLOWED_ORIGINS", allowedOrigins)
	mongoURI := GetEnv("MONGODB_URI", "mongodb://localhost:27017")
	mongoDBName := GetEnv("MONGODB_NAME", "pocketrun")
	jwtSecret := GetEnv("JWT_SECRET", "pocketrun-secret-key-change-in-production")

	return &Config{
		AdminPort:      adminPort,
		PublicPort:     publicPort,
		APIMode:        apiMode,
		Env:            env,
		AllowedOrigins: allowedOrigins,
		AdminOrigins:   adminOrigins,
		MongoURI:       mongoURI,
		MongoDBName:    mongoDBName,
		JWTSecret:      jwtSecret,
	}
}

func ensureEnvLoaded() {
	envOnce.Do(func() {
		loadEnvFile(".env")
	})
}

func loadEnvFile(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			value = strings.Trim(value, `"'`)
			if os.Getenv(key) == "" {
				os.Setenv(key, value)
			}
		}
	}
}

func GetEnv(key, defaultValue string) string {
	ensureEnvLoaded()
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return defaultValue
}
