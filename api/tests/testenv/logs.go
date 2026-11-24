package testenv

import (
	"bytes"
	"regexp"
	"sync"
)

var setupTokenPattern = regexp.MustCompile(`setupToken=([A-Z0-9-]+)`)

type logBuffer struct {
	mutex  sync.Mutex
	buffer bytes.Buffer
}

func (b *logBuffer) Write(content []byte) (int, error) {
	b.mutex.Lock()
	defer b.mutex.Unlock()
	return b.buffer.Write(content)
}

func (b *logBuffer) lastSetupToken() string {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	matches := setupTokenPattern.FindAllStringSubmatch(b.buffer.String(), -1)
	if len(matches) == 0 {
		return ""
	}
	return matches[len(matches)-1][1]
}

func (e *Env) SetupToken() string {
	e.t.Helper()

	token := e.logs.lastSetupToken()
	if token == "" {
		e.t.Fatal("api did not log a setup token")
	}
	return token
}
