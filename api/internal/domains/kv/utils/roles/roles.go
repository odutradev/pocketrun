package roles

import (
	"errors"
	"regexp"
	"slices"
	"strings"
	"time"

	applicationrepository "pocketrun-api/internal/repositories/application"
)

const (
	MaxNameLength = 40
	PageRead      = "leitura"
	PageWrite     = "escrita"
	PageManage    = "gestao"
)

var (
	ErrNotFound    = errors.New("role not found")
	ErrReserved    = errors.New("role name is reserved")
	ErrInvalidName = errors.New("invalid role name")
	ErrInvalidRule = errors.New("invalid role rule")
	namePattern    = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	rulePattern    = regexp.MustCompile(`^(\*|[A-Za-z0-9_-]{1,64})$`)
	ruleOperations = []applicationrepository.Operation{applicationrepository.OperationRead, applicationrepository.OperationCreate, applicationrepository.OperationUpdate, applicationrepository.OperationDelete}
)

func Normalize(rules []applicationrepository.Rule) []applicationrepository.Rule {
	normalized := make([]applicationrepository.Rule, 0, len(rules))
	for _, rule := range rules {
		operations := []applicationrepository.Operation{}
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
		normalized = append(normalized, applicationrepository.Rule{Collection: strings.TrimSpace(rule.Collection), Operations: operations, MaxDocuments: rule.MaxDocuments})
	}
	return normalized
}

func CheckName(name string) error {
	if name == applicationrepository.AdminRole {
		return ErrReserved
	}
	if len(name) > MaxNameLength || !namePattern.MatchString(name) {
		return ErrInvalidName
	}
	return nil
}

func CheckRules(rules []applicationrepository.Rule) error {
	seen := map[string]bool{}
	for _, rule := range rules {
		if !rulePattern.MatchString(rule.Collection) || seen[rule.Collection] {
			return ErrInvalidRule
		}
		seen[rule.Collection] = true
	}
	return nil
}

func ForPage(now time.Time) []applicationrepository.Role {
	return []applicationrepository.Role{
		{
			Name:        PageRead,
			Description: "Só lê os documentos",
			Rules:       []applicationrepository.Rule{{Collection: applicationrepository.AnyCollection, Operations: []applicationrepository.Operation{applicationrepository.OperationRead}}},
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			Name:        PageWrite,
			Description: "Lê, cria e edita os documentos",
			Rules:       []applicationrepository.Rule{{Collection: applicationrepository.AnyCollection, Operations: []applicationrepository.Operation{applicationrepository.OperationRead, applicationrepository.OperationCreate, applicationrepository.OperationUpdate}}},
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			Name:        PageManage,
			Description: "Lê, cria, edita e apaga os documentos",
			Rules:       []applicationrepository.Rule{{Collection: applicationrepository.AnyCollection, Operations: []applicationrepository.Operation{applicationrepository.OperationRead, applicationrepository.OperationCreate, applicationrepository.OperationUpdate, applicationrepository.OperationDelete}}},
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}
}
