package config

import (
	"bufio"
	"os"
	"strings"
	"sync"
)

var envOnce sync.Once

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
