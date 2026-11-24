package application

import (
	"errors"
	"regexp"
	"slices"
	"strings"
)

const (
	MaxRoles            = 20
	MaxRules            = 30
	MaxRoleNameLength   = 40
	MaxDescriptionChars = 200
)

var (
	ErrRoleNotFound    = errors.New("role not found")
	ErrRoleTaken       = errors.New("role name already used in this application")
	ErrRoleReserved    = errors.New("role name is reserved")
	ErrInvalidRoleName = errors.New("invalid role name")
	ErrInvalidRule     = errors.New("invalid role rule")
	ErrTooManyRoles    = errors.New("application has too many roles")
	ErrRoleInUse       = errors.New("role is used by a token")
	rolePattern        = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	rulePattern        = regexp.MustCompile(`^(\*|[A-Za-z0-9_-]{1,64})$`)
	ruleOperations     = []Operation{OperationRead, OperationCreate, OperationUpdate, OperationDelete}
)

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
