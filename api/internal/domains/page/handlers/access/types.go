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

	pageaccessrepository "pocketrun-api/internal/repositories/pageaccess"
)

const (
	PINLength           = 6
	MaxKeys             = 20
	DefaultSessionHours = 24
	MaxSessionHours     = 720
	MaxFormBytes        = 1024
)

var (
	ErrAccessConflict  = pageaccessrepository.ErrConflict
	ErrKeyNotFound     = errors.New("page access key not found")
	ErrInvalidKeyID    = errors.New("invalid page access key id")
	ErrInvalidPIN      = errors.New("pin must have six digits")
	ErrWeakPIN         = errors.New("pin is too easy to guess")
	ErrPINInUse        = errors.New("pin already used by another key of this page")
	ErrRoleTaken       = errors.New("role already used in this page")
	ErrInvalidRole     = errors.New("invalid role name")
	ErrTooManyKeys     = errors.New("page has too many access keys")
	ErrNoKeys          = errors.New("page has no access keys")
	ErrLastKey         = errors.New("cannot remove the last key while protection is on")
	ErrWrongPIN        = errors.New("wrong pin")
	ErrTooManyAttempts = errors.New("too many wrong pins")
	ErrNotProtected    = errors.New("page is not protected")
	ErrPINUnavailable  = errors.New("pin was saved before it could be shown again")
	errAccessNotFound  = pageaccessrepository.ErrNotFound
)

func newAccess(pageID bson.ObjectID) *pageaccessrepository.Access {
	return &pageaccessrepository.Access{PageID: pageID, Keys: []pageaccessrepository.Key{}, SessionHours: DefaultSessionHours}
}

func applyAccessDefaults(a *pageaccessrepository.Access) {
	if a.SessionHours <= 0 {
		a.SessionHours = DefaultSessionHours
	}
	for index := range a.Keys {
		a.Keys[index].IsRevealable = a.Keys[index].PINCipher != ""
	}
}

func sessionDuration(a *pageaccessrepository.Access) time.Duration {
	applyAccessDefaults(a)
	return time.Duration(a.SessionHours) * time.Hour
}

func findKey(a *pageaccessrepository.Access, id bson.ObjectID) (*pageaccessrepository.Key, error) {
	for index := range a.Keys {
		if a.Keys[index].ID == id {
			return &a.Keys[index], nil
		}
	}
	return nil, ErrKeyNotFound
}

func ensureRoleFree(a *pageaccessrepository.Access, role string, ownerID *bson.ObjectID) error {
	for _, key := range a.Keys {
		if key.Role == role && (ownerID == nil || key.ID != *ownerID) {
			return ErrRoleTaken
		}
	}
	return nil
}

func ensurePINFree(a *pageaccessrepository.Access, hash string, ownerID *bson.ObjectID) error {
	for _, key := range a.Keys {
		if key.PINHash == hash && (ownerID == nil || key.ID != *ownerID) {
			return ErrPINInUse
		}
	}
	return nil
}

type Decision struct {
	IsProtected bool
	IsAllowed   bool
	Role        string
}

type Grant struct {
	Token     string
	ExpiresAt time.Time
	Role      string
}

type StatusInput struct {
	IsEnabled *bool `json:"isEnabled" validate:"required"`
}

type SessionInput struct {
	SessionHours *int `json:"sessionHours" validate:"required,min=1,max=720"`
}

type KeyInput struct {
	Role string `json:"role" validate:"max=64"`
	PIN  string `json:"pin" validate:"omitempty,len=6,numeric"`
}

func (i *KeyInput) Normalize() {
	i.Role = strings.ToLower(strings.TrimSpace(i.Role))
	i.PIN = strings.TrimSpace(i.PIN)
}

type RoleInput struct {
	Role string `json:"role" validate:"max=64"`
}

func (i *RoleInput) Normalize() {
	i.Role = strings.ToLower(strings.TrimSpace(i.Role))
}

type PINInput struct {
	PIN string `json:"pin" validate:"omitempty,len=6,numeric"`
}

func (i *PINInput) Normalize() {
	i.PIN = strings.TrimSpace(i.PIN)
}

type Revealed struct {
	PIN string `json:"pin"`
}

type Issued struct {
	Access *pageaccessrepository.Access `json:"access"`
	PIN    string                       `json:"pin"`
}

func ParseKeyID(value string) (bson.ObjectID, error) {
	id, err := bson.ObjectIDFromHex(value)
	if err != nil {
		return bson.ObjectID{}, ErrInvalidKeyID
	}
	return id, nil
}

const maxGenerateTries = 50

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

func (s secrets) issueToken(pageID bson.ObjectID, key pageaccessrepository.Key, revision int, issuedAt, expiresAt time.Time) string {
	payload := []string{key.ID.Hex(), strconv.Itoa(revision), strconv.FormatInt(issuedAt.Unix(), 10), strconv.FormatInt(expiresAt.Unix(), 10)}
	signature := sign(s.session, append([]string{pageID.Hex(), key.Secret}, payload...)...)
	return strings.Join(append(payload, signature), ".")
}

func (s secrets) verifyToken(access *pageaccessrepository.Access, token string, now time.Time) (*pageaccessrepository.Key, bool) {
	parts := strings.Split(token, ".")
	if len(parts) != 5 {
		return nil, false
	}

	keyID, err := bson.ObjectIDFromHex(parts[0])
	if err != nil {
		return nil, false
	}
	key, err := findKey(access, keyID)
	if err != nil {
		return nil, false
	}
	if parts[1] != strconv.Itoa(access.Revision) {
		return nil, false
	}
	issuedAt, err := strconv.ParseInt(parts[2], 10, 64)
	if err != nil || time.Unix(issuedAt, 0).After(now.Add(time.Minute)) {
		return nil, false
	}
	expiresAt, err := strconv.ParseInt(parts[3], 10, 64)
	if err != nil || now.Unix() >= expiresAt {
		return nil, false
	}
	if !now.Before(time.Unix(issuedAt, 0).Add(sessionDuration(access))) {
		return nil, false
	}

	expected := sign(s.session, access.PageID.Hex(), key.Secret, parts[0], parts[1], parts[2], parts[3])
	if !hmac.Equal([]byte(expected), []byte(parts[4])) {
		return nil, false
	}
	return key, true
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

const (
	pageLimitMax     = 50
	visitorActorName = "Visitante"
	roleField        = "role"
	sessionField     = "sessionHours"
)

type limit struct {
	window time.Duration
	max    int64
}
