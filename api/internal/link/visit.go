package link

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const OpenRetention = 365 * 24 * time.Hour

type Device string

const (
	DeviceDesktop Device = "desktop"
	DeviceMobile  Device = "mobile"
	DeviceTablet  Device = "tablet"
)

type Visit struct {
	IP        string
	UserAgent string
	Referrer  string
}

type Open struct {
	ID       bson.ObjectID `bson:"_id"`
	LinkID   bson.ObjectID `bson:"linkId"`
	At       time.Time     `bson:"at"`
	Visitor  string        `bson:"visitor"`
	Referrer string        `bson:"referrer"`
	Device   Device        `bson:"device"`
	System   string        `bson:"system"`
	Browser  string        `bson:"browser"`
	IsBot    bool          `bson:"isBot"`
}

func VisitFromRequest(r *http.Request) Visit {
	return Visit{IP: clientIP(r), UserAgent: r.UserAgent(), Referrer: r.Referer()}
}

func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		first, _, _ := strings.Cut(forwarded, ",")
		return strings.TrimSpace(first)
	}
	if realIP := r.Header.Get("X-Real-Ip"); realIP != "" {
		return strings.TrimSpace(realIP)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

type VisitorHasher struct {
	mutex sync.Mutex
	day   string
	salt  []byte
}

func NewVisitorHasher() *VisitorHasher {
	return &VisitorHasher{}
}

func (h *VisitorHasher) Hash(visit Visit, at time.Time) (string, error) {
	salt, err := h.saltFor(at.UTC().Format(time.DateOnly))
	if err != nil {
		return "", fmt.Errorf("hash visitor: %w", err)
	}

	digest := sha256.New()
	digest.Write(salt)
	digest.Write([]byte(visit.IP))
	digest.Write([]byte{0})
	digest.Write([]byte(visit.UserAgent))
	return hex.EncodeToString(digest.Sum(nil)[:16]), nil
}

func (h *VisitorHasher) saltFor(day string) ([]byte, error) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if h.day == day {
		return h.salt, nil
	}

	salt := make([]byte, 32)
	if _, err := rand.Read(salt); err != nil {
		return nil, fmt.Errorf("generate visitor salt: %w", err)
	}
	h.day = day
	h.salt = salt
	return salt, nil
}

func newOpen(linkID bson.ObjectID, visit Visit, visitor string, at time.Time) *Open {
	agent := strings.ToLower(visit.UserAgent)
	return &Open{
		ID:       bson.NewObjectID(),
		LinkID:   linkID,
		At:       at,
		Visitor:  visitor,
		Referrer: referrerHost(visit.Referrer),
		Device:   deviceOf(agent),
		System:   systemOf(agent),
		Browser:  browserOf(agent),
		IsBot:    isBot(agent),
	}
}

func isBot(agent string) bool {
	if agent == "" {
		return true
	}
	markers := []string{
		"bot", "crawler", "spider", "preview", "facebookexternalhit", "whatsapp", "slack", "discord",
		"telegram", "embedly", "curl", "wget", "python", "go-http-client", "headless", "lighthouse",
	}
	for _, marker := range markers {
		if strings.Contains(agent, marker) {
			return true
		}
	}
	return false
}

func deviceOf(agent string) Device {
	switch {
	case strings.Contains(agent, "ipad"), strings.Contains(agent, "tablet"):
		return DeviceTablet
	case strings.Contains(agent, "android") && !strings.Contains(agent, "mobile"):
		return DeviceTablet
	case strings.Contains(agent, "mobi"), strings.Contains(agent, "iphone"), strings.Contains(agent, "android"):
		return DeviceMobile
	default:
		return DeviceDesktop
	}
}

func systemOf(agent string) string {
	switch {
	case strings.Contains(agent, "iphone"), strings.Contains(agent, "ipad"):
		return "iOS"
	case strings.Contains(agent, "android"):
		return "Android"
	case strings.Contains(agent, "windows"):
		return "Windows"
	case strings.Contains(agent, "cros"):
		return "ChromeOS"
	case strings.Contains(agent, "mac os"):
		return "macOS"
	case strings.Contains(agent, "linux"):
		return "Linux"
	default:
		return "Outros"
	}
}

func browserOf(agent string) string {
	switch {
	case strings.Contains(agent, "edg"):
		return "Edge"
	case strings.Contains(agent, "opr/"), strings.Contains(agent, "opera"):
		return "Opera"
	case strings.Contains(agent, "samsungbrowser"):
		return "Samsung Internet"
	case strings.Contains(agent, "firefox"), strings.Contains(agent, "fxios"):
		return "Firefox"
	case strings.Contains(agent, "chrome"), strings.Contains(agent, "crios"):
		return "Chrome"
	case strings.Contains(agent, "safari"):
		return "Safari"
	default:
		return "Outros"
	}
}

func referrerHost(value string) string {
	if value == "" {
		return ""
	}
	parsed, err := url.Parse(value)
	if err != nil || parsed.Hostname() == "" {
		return ""
	}
	return strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.")
}
