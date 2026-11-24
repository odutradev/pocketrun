package application

import (
	"context"
	"errors"
	"fmt"
	applicationrepository "pocketrun-api/internal/repositories/application"
	"time"
	"unicode/utf8"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	PageReadRole     = "leitura"
	PageWriteRole    = "escrita"
	PageManageRole   = "gestao"
	pageNamePrefix   = "Página "
	pageProjectIDTag = "page-"
	maxNameRunes     = 100
)

type PageInput struct {
	PageID bson.ObjectID
	Title  string
	Slug   string
}

func PageRoles(now time.Time) []applicationrepository.Role {
	return []applicationrepository.Role{
		{
			Name:        PageReadRole,
			Description: "Só lê os documentos",
			Rules:       []applicationrepository.Rule{{Collection: applicationrepository.AnyCollection, Operations: []applicationrepository.Operation{applicationrepository.OperationRead}}},
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			Name:        PageWriteRole,
			Description: "Lê, cria e edita os documentos",
			Rules:       []applicationrepository.Rule{{Collection: applicationrepository.AnyCollection, Operations: []applicationrepository.Operation{applicationrepository.OperationRead, applicationrepository.OperationCreate, applicationrepository.OperationUpdate}}},
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			Name:        PageManageRole,
			Description: "Lê, cria, edita e apaga os documentos",
			Rules:       []applicationrepository.Rule{{Collection: applicationrepository.AnyCollection, Operations: []applicationrepository.Operation{applicationrepository.OperationRead, applicationrepository.OperationCreate, applicationrepository.OperationUpdate, applicationrepository.OperationDelete}}},
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}
}

func (s *Service) EnsureForPage(ctx context.Context, managerID bson.ObjectID, input PageInput) (*applicationrepository.Application, bool, error) {
	current, err := s.repository.FindByPageID(ctx, input.PageID)
	if err == nil {
		return current, false, nil
	}
	if !errors.Is(err, ErrApplicationNotFound) {
		return nil, false, fmt.Errorf("find application of page %s: %w", input.PageID.Hex(), err)
	}

	now := time.Now()
	pageID := input.PageID
	created := &applicationrepository.Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerID,
		PageID:                  &pageID,
		Name:                    pageName(input.Title),
		ProjectID:               pageProjectIDTag + pageID.Hex(),
		Description:             fmt.Sprintf("Dados da página /%s, criada pela aba Dados do Pages.", input.Slug),
		AllowedOrigins:          []string{},
		AllowNonBrowserRequests: false,
		Tokens:                  []applicationrepository.Token{},
		Roles:                   PageRoles(now),
		CreatedAt:               now,
		UpdatedAt:               now,
	}

	err = s.repository.Insert(ctx, created)
	if errors.Is(err, ErrProjectIDTaken) {
		existing, findErr := s.repository.FindByPageID(ctx, input.PageID)
		if findErr != nil {
			return nil, false, fmt.Errorf("find application of page %s: %w", input.PageID.Hex(), findErr)
		}
		return existing, false, nil
	}
	if err != nil {
		return nil, false, fmt.Errorf("create application of page %s: %w", input.PageID.Hex(), err)
	}
	return created, true, nil
}

func (s *Service) FindForPage(ctx context.Context, pageID bson.ObjectID) (*applicationrepository.Application, error) {
	current, err := s.repository.FindByPageID(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("find application of page %s: %w", pageID.Hex(), err)
	}
	return current, nil
}

func (s *Service) DeleteForPage(ctx context.Context, pageID bson.ObjectID) error {
	deleted, err := s.repository.DeleteByPageID(ctx, pageID)
	if errors.Is(err, ErrApplicationNotFound) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("delete application of page %s: %w", pageID.Hex(), err)
	}
	if _, err := s.documents.DeleteByApplicationID(ctx, deleted.ID); err != nil {
		return fmt.Errorf("delete documents of page application %s: %w", deleted.ID.Hex(), err)
	}
	return nil
}

func pageName(title string) string {
	name := pageNamePrefix + title
	if utf8.RuneCountInString(name) <= maxNameRunes {
		return name
	}
	return string([]rune(name)[:maxNameRunes])
}
