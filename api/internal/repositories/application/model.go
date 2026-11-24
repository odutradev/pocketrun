package application

import (
	"slices"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Application struct {
	ID                      bson.ObjectID  `json:"id" bson:"_id"`
	ManagerID               bson.ObjectID  `json:"managerId" bson:"managerId"`
	PageID                  *bson.ObjectID `json:"pageId" bson:"pageId,omitempty"`
	Name                    string         `json:"name" bson:"name"`
	ProjectID               string         `json:"projectId" bson:"projectId"`
	Description             string         `json:"description" bson:"description"`
	AllowedOrigins          []string       `json:"allowedOrigins" bson:"allowedOrigins"`
	AllowNonBrowserRequests bool           `json:"allowNonBrowserRequests" bson:"allowNonBrowserRequests"`
	Tokens                  []Token        `json:"tokens,omitempty" bson:"tokens"`
	Roles                   []Role         `json:"roles" bson:"roles"`
	CreatedAt               time.Time      `json:"createdAt" bson:"createdAt"`
	UpdatedAt               time.Time      `json:"updatedAt" bson:"updatedAt"`
}

type Token struct {
	ID         string     `json:"id" bson:"id"`
	Name       string     `json:"name" bson:"name"`
	Hash       string     `json:"-" bson:"tokenHash"`
	Prefix     string     `json:"tokenPrefix" bson:"tokenPrefix"`
	Role       string     `json:"role" bson:"role,omitempty"`
	ExpiresAt  *time.Time `json:"expiresAt" bson:"expiresAt,omitempty"`
	CreatedAt  time.Time  `json:"createdAt" bson:"createdAt"`
	LastUsedAt *time.Time `json:"lastUsedAt" bson:"lastUsedAt,omitempty"`
}

func (t Token) IsExpired(now time.Time) bool {
	return t.ExpiresAt != nil && now.After(*t.ExpiresAt)
}

type Rule struct {
	Collection   string      `json:"collection" bson:"collection" validate:"required,max=64"`
	Operations   []Operation `json:"operations" bson:"operations" validate:"required,min=1,max=4,dive,oneof=read create update delete"`
	MaxDocuments int         `json:"maxDocuments" bson:"maxDocuments" validate:"min=0,max=1000000"`
}

type Role struct {
	Name               string    `json:"name" bson:"name"`
	Description        string    `json:"description" bson:"description"`
	Rules              []Rule    `json:"rules" bson:"rules"`
	IsOwnDocumentsOnly bool      `json:"isOwnDocumentsOnly" bson:"isOwnDocumentsOnly"`
	CreatedAt          time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt" bson:"updatedAt"`
}

func (t Token) RoleName() string {
	if t.Role == "" {
		return AdminRole
	}
	return t.Role
}

func (a *Application) Role(name string) (*Role, bool) {
	for index := range a.Roles {
		if a.Roles[index].Name == name {
			return &a.Roles[index], true
		}
	}
	return nil, false
}

func (a *Application) HasRole(name string) bool {
	_, found := a.Role(name)
	return name == AdminRole || found
}

func (a *Application) Authorize(roleName, collectionName string, operation Operation) (Permission, error) {
	if roleName == AdminRole {
		return Permission{Role: AdminRole, IsAdmin: true}, nil
	}

	role, found := a.Role(roleName)
	if !found || operation == OperationManage {
		return Permission{}, ErrOperationForbidden
	}

	rule, found := role.rule(collectionName)
	if !found || !slices.Contains(rule.Operations, operation) {
		return Permission{}, ErrOperationForbidden
	}
	return Permission{Role: role.Name, IsOwnDocumentsOnly: role.IsOwnDocumentsOnly, MaxDocuments: rule.MaxDocuments}, nil
}

func (r *Role) rule(collectionName string) (Rule, bool) {
	wildcard := Rule{}
	hasWildcard := false
	for _, rule := range r.Rules {
		if rule.Collection == collectionName {
			return rule, true
		}
		if rule.Collection == AnyCollection {
			wildcard, hasWildcard = rule, true
		}
	}
	return wildcard, hasWildcard
}
