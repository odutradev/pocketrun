package application

import (
	"errors"
	"regexp"
	"slices"
	"strings"
	"time"
)

const (
	AdminRole           = "admin"
	AnyCollection       = "*"
	MaxRoles            = 20
	MaxRules            = 30
	MaxRoleNameLength   = 40
	MaxDescriptionChars = 200
)

type Operation string

const (
	OperationRead   Operation = "read"
	OperationCreate Operation = "create"
	OperationUpdate Operation = "update"
	OperationDelete Operation = "delete"
	OperationManage Operation = "manage"
)

var (
	ErrRoleNotFound       = errors.New("role not found")
	ErrRoleTaken          = errors.New("role name already used in this application")
	ErrRoleReserved       = errors.New("role name is reserved")
	ErrInvalidRoleName    = errors.New("invalid role name")
	ErrInvalidRule        = errors.New("invalid role rule")
	ErrTooManyRoles       = errors.New("application has too many roles")
	ErrRoleInUse          = errors.New("role is used by a token")
	ErrOperationForbidden = errors.New("operation not allowed for this role")
	rolePattern           = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	rulePattern           = regexp.MustCompile(`^(\*|[A-Za-z0-9_-]{1,64})$`)
	ruleOperations        = []Operation{OperationRead, OperationCreate, OperationUpdate, OperationDelete}
)

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

type Permission struct {
	Role               string
	IsAdmin            bool
	IsOwnDocumentsOnly bool
	MaxDocuments       int
}

type RoleInput struct {
	Name               string `json:"name" validate:"required,max=40"`
	Description        string `json:"description" validate:"max=200"`
	Rules              []Rule `json:"rules" validate:"required,min=1,max=30,dive"`
	IsOwnDocumentsOnly bool   `json:"isOwnDocumentsOnly"`
}

func (i *RoleInput) Normalize() {
	i.Name = strings.ToLower(strings.TrimSpace(i.Name))
	i.Description = strings.TrimSpace(i.Description)
	i.Rules = normalizeRules(i.Rules)
}

type RoleUpdateInput struct {
	Description        string `json:"description" validate:"max=200"`
	Rules              []Rule `json:"rules" validate:"required,min=1,max=30,dive"`
	IsOwnDocumentsOnly bool   `json:"isOwnDocumentsOnly"`
}

func (i *RoleUpdateInput) Normalize() {
	i.Description = strings.TrimSpace(i.Description)
	i.Rules = normalizeRules(i.Rules)
}

type TokenRoleInput struct {
	Role string `json:"role" validate:"required,max=40"`
}

func (i *TokenRoleInput) Normalize() {
	i.Role = strings.ToLower(strings.TrimSpace(i.Role))
}

func normalizeRules(rules []Rule) []Rule {
	normalized := make([]Rule, 0, len(rules))
	for _, rule := range rules {
		operations := []Operation{}
		for _, operation := range ruleOperations {
			if slices.Contains(rule.Operations, operation) {
				operations = append(operations, operation)
			}
		}
		for _, operation := range rule.Operations {
			if !slices.Contains(ruleOperations, operation) {
				operations = append(operations, operation)
			}
		}
		normalized = append(normalized, Rule{Collection: strings.TrimSpace(rule.Collection), Operations: operations, MaxDocuments: rule.MaxDocuments})
	}
	return normalized
}

func checkRoleName(name string) error {
	if name == AdminRole {
		return ErrRoleReserved
	}
	if len(name) > MaxRoleNameLength || !rolePattern.MatchString(name) {
		return ErrInvalidRoleName
	}
	return nil
}

func checkRules(rules []Rule) error {
	seen := map[string]bool{}
	for _, rule := range rules {
		if !rulePattern.MatchString(rule.Collection) || seen[rule.Collection] {
			return ErrInvalidRule
		}
		seen[rule.Collection] = true
	}
	return nil
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
