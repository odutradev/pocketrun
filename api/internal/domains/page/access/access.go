package access

import (
	"errors"
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
