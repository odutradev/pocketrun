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
	ErrPINInUse        = errors.New("pin already used by another key of this page")
	ErrRoleTaken       = errors.New("role already used in this page")
	ErrInvalidRole     = errors.New("invalid role name")
	ErrTooManyKeys     = errors.New("page has too many access keys")
	ErrNoKeys          = errors.New("page has no access keys")
	ErrLastKey         = errors.New("cannot remove the last key while protection is on")
	ErrWrongPIN        = errors.New("wrong pin")
	ErrTooManyAttempts = errors.New("too many wrong pins")
	ErrNotProtected    = errors.New("page is not protected")
	errAccessNotFound  = pageaccessrepository.ErrNotFound
)

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
