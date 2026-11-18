package access

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const maxGenerateTries = 50

var pinPattern = regexp.MustCompile(`^[0-9]{6}$`)

type secrets struct {
	pin     []byte
	session []byte
	client  []byte
}

func newSecrets(master string) secrets {
	return secrets{
		pin:     derive(master, "page-access-pin"),
		session: derive(master, "page-access-session"),
		client:  derive(master, "page-access-client"),
	}
}

func derive(master, purpose string) []byte {
	mac := hmac.New(sha256.New, []byte(master))
	mac.Write([]byte(purpose))
	return mac.Sum(nil)
}

func sign(key []byte, parts ...string) string {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(strings.Join(parts, "\x00")))
	return hex.EncodeToString(mac.Sum(nil))
}

func (s secrets) hashPIN(pageID bson.ObjectID, pin string) string {
	return sign(s.pin, pageID.Hex(), pin)
}

func (s secrets) hashClient(pageID bson.ObjectID, client string) string {
	return sign(s.client, pageID.Hex(), client)[:32]
}

func (s secrets) issueToken(pageID bson.ObjectID, key Key, revision int, expiresAt time.Time) string {
	payload := []string{key.ID.Hex(), strconv.Itoa(revision), strconv.FormatInt(expiresAt.Unix(), 10)}
	signature := sign(s.session, append([]string{pageID.Hex(), key.Secret}, payload...)...)
	return strings.Join(append(payload, signature), ".")
}

func (s secrets) verifyToken(access *Access, token string, now time.Time) bool {
	parts := strings.Split(token, ".")
	if len(parts) != 4 {
		return false
	}

	keyID, err := bson.ObjectIDFromHex(parts[0])
	if err != nil {
		return false
	}
	key, err := access.key(keyID)
	if err != nil {
		return false
	}
	if parts[1] != strconv.Itoa(access.Revision) {
		return false
	}
	expiresAt, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil || now.Unix() >= expiresAt {
		return false
	}

	expected := sign(s.session, access.PageID.Hex(), key.Secret, parts[0], parts[1], parts[2])
	return hmac.Equal([]byte(expected), []byte(parts[3]))
}

func newKeySecret() (string, error) {
	buffer := make([]byte, 16)
	if _, err := rand.Read(buffer); err != nil {
		return "", fmt.Errorf("generate key secret: %w", err)
	}
	return hex.EncodeToString(buffer), nil
}

func generatePIN() (string, error) {
	limit := big.NewInt(1_000_000)
	for range maxGenerateTries {
		number, err := rand.Int(rand.Reader, limit)
		if err != nil {
			return "", fmt.Errorf("generate pin: %w", err)
		}
		pin := fmt.Sprintf("%06d", number.Int64())
		if !isWeakPIN(pin) {
			return pin, nil
		}
	}
	return "", fmt.Errorf("generate pin: %w", ErrWeakPIN)
}

func checkPIN(pin string) error {
	if !pinPattern.MatchString(pin) {
		return ErrInvalidPIN
	}
	if isWeakPIN(pin) {
		return ErrWeakPIN
	}
	return nil
}

func isWeakPIN(pin string) bool {
	return isRepeated(pin, 1) || isRepeated(pin, 2) || isRepeated(pin, 3) || isSequence(pin, 1) || isSequence(pin, -1)
}

func isRepeated(pin string, size int) bool {
	for index := size; index < len(pin); index++ {
		if pin[index] != pin[index-size] {
			return false
		}
	}
	return true
}

func isSequence(pin string, step int) bool {
	for index := 1; index < len(pin); index++ {
		if int(pin[index])-int(pin[index-1]) != step {
			return false
		}
	}
	return true
}
