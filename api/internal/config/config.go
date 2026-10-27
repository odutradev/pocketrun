package config

import (
	"bufio"
	"os"
	"strings"
	"sync"
)

var loadEnvironmentOnce sync.Once

func ensureEnvironmentLoaded() {
	loadEnvironmentOnce.Do(func() {
		loadEnvironmentFile(".env")
	})
}

func loadEnvironmentFile(filePath string) {
	environmentFile, openError := os.Open(filePath)
	if openError != nil {
		return
	}
	defer environmentFile.Close()

	lineScanner := bufio.NewScanner(environmentFile)
	for lineScanner.Scan() {
		trimmedLine := strings.TrimSpace(lineScanner.Text())
		if trimmedLine == "" || strings.HasPrefix(trimmedLine, "#") {
			continue
		}

		keyValueParts := strings.SplitN(trimmedLine, "=", 2)
		if len(keyValueParts) == 2 {
			environmentKey := strings.TrimSpace(keyValueParts[0])
			environmentValue := strings.TrimSpace(keyValueParts[1])
			environmentValue = strings.Trim(environmentValue, `"'`)
			if os.Getenv(environmentKey) == "" {
				os.Setenv(environmentKey, environmentValue)
			}
		}
	}
}

func GetEnv(environmentKey, defaultValue string) string {
	ensureEnvironmentLoaded()
	if environmentValue := strings.TrimSpace(os.Getenv(environmentKey)); environmentValue != "" {
		return environmentValue
	}
	return defaultValue
}
