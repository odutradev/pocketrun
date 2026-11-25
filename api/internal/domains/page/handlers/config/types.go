package config

import (
	"strings"

	"pocketrun-api/internal/domains/kv/handlers/application"
	"pocketrun-api/internal/domains/page/handlers/access"
	applicationrepository "pocketrun-api/internal/repositories/application"
)

const Version = 1

type Input struct {
	Version int          `json:"version" validate:"omitempty,eq=1"`
	Access  *AccessInput `json:"access"`
	KV      *KVInput     `json:"kv"`
}

type AccessInput struct {
	IsEnabled    *bool      `json:"isEnabled"`
	SessionHours *int       `json:"sessionHours" validate:"omitempty,min=1,max=720"`
	PINs         []PINInput `json:"pins" validate:"max=20,dive"`
}

type PINInput struct {
	Role   string  `json:"role" validate:"max=64"`
	PIN    string  `json:"pin" validate:"omitempty,len=6,numeric"`
	KVRole *string `json:"kvRole" validate:"omitempty,max=40"`
}

type KVInput struct {
	IsEnabled  *bool                   `json:"isEnabled"`
	PublicRole *string                 `json:"publicRole" validate:"omitempty,max=40"`
	Roles      []application.RoleInput `json:"roles" validate:"max=20,dive"`
}

func (i *Input) Normalize() {
	if i.Access != nil {
		for index := range i.Access.PINs {
			pin := &i.Access.PINs[index]
			pin.Role = strings.ToLower(strings.TrimSpace(pin.Role))
			pin.PIN = strings.TrimSpace(pin.PIN)
			pin.KVRole = normalizeRole(pin.KVRole)
		}
	}
	if i.KV != nil {
		i.KV.PublicRole = normalizeRole(i.KV.PublicRole)
		for index := range i.KV.Roles {
			i.KV.Roles[index].Normalize()
		}
	}
}

func normalizeRole(value *string) *string {
	if value == nil {
		return nil
	}
	normalized := strings.ToLower(strings.TrimSpace(*value))
	return &normalized
}

type Config struct {
	Version int          `json:"version"`
	Access  AccessConfig `json:"access"`
	KV      KVConfig     `json:"kv"`
}

type AccessConfig struct {
	IsEnabled    bool        `json:"isEnabled"`
	SessionHours int         `json:"sessionHours"`
	PINs         []PINConfig `json:"pins"`
}

type PINConfig struct {
	Role   string `json:"role"`
	KVRole string `json:"kvRole"`
}

type KVConfig struct {
	IsEnabled  bool         `json:"isEnabled"`
	PublicRole string       `json:"publicRole"`
	Roles      []RoleConfig `json:"roles"`
}

type RoleConfig struct {
	Name               string                       `json:"name"`
	Description        string                       `json:"description"`
	IsOwnDocumentsOnly bool                         `json:"isOwnDocumentsOnly"`
	Rules              []applicationrepository.Rule `json:"rules"`
}

type Applied struct {
	Config Config             `json:"config"`
	Issued []access.IssuedPIN `json:"issued"`
}
