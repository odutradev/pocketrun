package access

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	maxGenerateTries = 50
	clockSkew        = time.Minute
)

var pinPattern = regexp.MustCompile(`^[0-9]{6}$`)

type secrets struct {
	pin     []byte
	session []byte
	client  []byte
	cipher  []byte
}

func newSecrets(master string) secrets {
	return secrets{
		pin:     derive(master, "page-access-pin"),
		session: derive(master, "page-access-session"),
		client:  derive(master, "page-access-client"),
		cipher:  derive(master, "page-access-pin-cipher"),
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

func (s secrets) encryptPIN(pageID, keyID bson.ObjectID, pin string) (string, error) {
	aead, err := s.aead()
	if err != nil {
		return "", fmt.Errorf("encrypt pin: %w", err)
	}
	nonce := make([]byte, aead.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", fmt.Errorf("encrypt pin: %w", err)
	}
	sealed := aead.Seal(nonce, nonce, []byte(pin), pinContext(pageID, keyID))
	return base64.RawURLEncoding.EncodeToString(sealed), nil
}

func (s secrets) decryptPIN(pageID, keyID bson.ObjectID, value string) (string, error) {
	aead, err := s.aead()
	if err != nil {
		return "", fmt.Errorf("decrypt pin: %w", err)
	}
	sealed, err := base64.RawURLEncoding.DecodeString(value)
	if err != nil || len(sealed) < aead.NonceSize() {
		return "", fmt.Errorf("decrypt pin: %w", ErrPINUnavailable)
	}
	pin, err := aead.Open(nil, sealed[:aead.NonceSize()], sealed[aead.NonceSize():], pinContext(pageID, keyID))
	if err != nil {
		return "", fmt.Errorf("decrypt pin: %w", errors.Join(ErrPINUnavailable, err))
	}
	return string(pin), nil
}

func (s secrets) aead() (cipher.AEAD, error) {
	block, err := aes.NewCipher(s.cipher)
	if err != nil {
		return nil, err
	}
	return cipher.NewGCM(block)
}

func pinContext(pageID, keyID bson.ObjectID) []byte {
	return []byte(pageID.Hex() + "\x00" + keyID.Hex())
}

func (s secrets) hashClient(pageID bson.ObjectID, client string) string {
	return sign(s.client, pageID.Hex(), client)[:32]
}

func (s secrets) issueToken(pageID bson.ObjectID, key Key, revision int, issuedAt, expiresAt time.Time) string {
	payload := []string{key.ID.Hex(), strconv.Itoa(revision), strconv.FormatInt(issuedAt.Unix(), 10), strconv.FormatInt(expiresAt.Unix(), 10)}
	signature := sign(s.session, append([]string{pageID.Hex(), key.Secret}, payload...)...)
	return strings.Join(append(payload, signature), ".")
}

func (s secrets) verifyToken(access *Access, token string, now time.Time) bool {
	parts := strings.Split(token, ".")
	if len(parts) != 5 {
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
	issuedAt, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil || time.Unix(issuedAt, 0).After(now.Add(clockSkew)) {
		return false
	}
	expiresAt, err := strconv.ParseInt(parts[3], 10, 64)
	if err != nil || now.Unix() >= expiresAt {
		return false
	}
	if !now.Before(time.Unix(issuedAt, 0).Add(access.sessionDuration())) {
		return false
	}

	expected := sign(s.session, access.PageID.Hex(), key.Secret, parts[0], parts[1], parts[2], parts[3])
	return hmac.Equal([]byte(expected), []byte(parts[4]))
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
