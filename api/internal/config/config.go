package config

import (
	"bufio"
	"os"
	"strings"
)

type Config struct {
	Port           string
	Env            string
	AllowedOrigins string
	MongoURI       string
	MongoDBName    string
	JWTSecret      string
}

func Load() *Config {
	loadEnvFile(".env")

	port := getEnv("PORT", "8080")
	env := getEnv("ENV", "development")
	allowedOrigins := getEnv("CORS_ALLOWED_ORIGINS", "*")
	mongoURI := getEnv("MONGODB_URI", "mongodb://localhost:27017")
	mongoDBName := getEnv("MONGODB_NAME", "pocketrun")
	jwtSecret := getEnv("JWT_SECRET", "pocketrun-secret-key-change-in-production")

	return &Config{
		Port:           port,
		Env:            env,
		AllowedOrigins: allowedOrigins,
		MongoURI:       mongoURI,
		MongoDBName:    mongoDBName,
		JWTSecret:      jwtSecret,
	}
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

	if err := scanner.Err(); err != nil {
		return
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
