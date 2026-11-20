package ratelimit

import (
	"sync"
	"time"
)

const cleanupThreshold = 10000

type window struct {
	start time.Time
	count int
}

type Limiter struct {
	mu       sync.Mutex
	duration time.Duration
	max      int
	windows  map[string]*window
}

func New(duration time.Duration, max int) *Limiter {
	return &Limiter{duration: duration, max: max, windows: map[string]*window{}}
}

func (l *Limiter) Allow(key string, now time.Time) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	if len(l.windows) > cleanupThreshold {
		l.cleanup(now)
	}

	current, found := l.windows[key]
	if !found || now.Sub(current.start) >= l.duration {
		l.windows[key] = &window{start: now, count: 1}
		return true
	}
	if current.count >= l.max {
		return false
	}
	current.count++
	return true
}

func (l *Limiter) cleanup(now time.Time) {
	for key, current := range l.windows {
		if now.Sub(current.start) >= l.duration {
			delete(l.windows, key)
		}
	}
}
