package application

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"time"
	"unicode/utf8"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/kv/utils/apptoken"
	"pocketrun-api/internal/domains/kv/utils/roles"
	applicationrepository "pocketrun-api/internal/repositories/application"
)

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
		Description:             fmt.Sprintf("Dados da página /%s, criada pela aba Acesso e dados das Páginas.", input.Slug),
		AllowedOrigins:          []string{},
		AllowNonBrowserRequests: false,
		Tokens:                  []applicationrepository.Token{},
		Roles:                   roles.ForPage(now),
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

func (s *Service) SetPageRoles(ctx context.Context, pageID bson.ObjectID, inputs []RoleInput) (*applicationrepository.Application, error) {
	current, err := s.repository.FindByPageID(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("find application of page %s: %w", pageID.Hex(), err)
	}
	next, err := ReplaceRoles(current, inputs, time.Now())
	if err != nil {
		return nil, err
	}
	if err := s.repository.SetRoles(ctx, current.ManagerID, current.ID, next); err != nil {
		return nil, fmt.Errorf("set roles of page application %s: %w", current.ID.Hex(), err)
	}
	current.Roles = next
	return current, nil
}

func CheckRoleInputs(inputs []RoleInput) error {
	if len(inputs) > MaxRoles {
		return ErrTooManyRoles
	}
	seen := map[string]bool{}
	for _, input := range inputs {
		if err := roles.CheckName(input.Name); err != nil {
			return err
		}
		if seen[input.Name] {
			return ErrRoleTaken
		}
		seen[input.Name] = true
		if len(input.Rules) == 0 || len(input.Rules) > MaxRules {
			return ErrInvalidRule
		}
		if err := roles.CheckRules(input.Rules); err != nil {
			return err
		}
	}
	return nil
}

func ReplaceRoles(current *applicationrepository.Application, inputs []RoleInput, now time.Time) ([]applicationrepository.Role, error) {
	if err := CheckRoleInputs(inputs); err != nil {
		return nil, err
	}

	kept := map[string]bool{}
	next := make([]applicationrepository.Role, 0, len(inputs))
	for _, input := range inputs {
		kept[input.Name] = true
		role := applicationrepository.Role{Name: input.Name, Description: input.Description, Rules: input.Rules, IsOwnDocumentsOnly: input.IsOwnDocumentsOnly, CreatedAt: now, UpdatedAt: now}
		if previous, found := current.Role(input.Name); found {
			role.CreatedAt = previous.CreatedAt
			role.UpdatedAt = previous.UpdatedAt
			if !sameRole(*previous, role) {
				role.UpdatedAt = now
			}
		}
		next = append(next, role)
	}
	for _, token := range current.Tokens {
		if token.Role != "" && !kept[token.Role] {
			return nil, ErrRoleInUse
		}
	}
	return next, nil
}

func sameRole(first, second applicationrepository.Role) bool {
	if first.Description != second.Description || first.IsOwnDocumentsOnly != second.IsOwnDocumentsOnly || len(first.Rules) != len(second.Rules) {
		return false
	}
	for index := range first.Rules {
		if first.Rules[index].Collection != second.Rules[index].Collection || first.Rules[index].MaxDocuments != second.Rules[index].MaxDocuments || !slices.Equal(first.Rules[index].Operations, second.Rules[index].Operations) {
			return false
		}
	}
	return true
}

func pageName(title string) string {
	name := pageNamePrefix + title
	if utf8.RuneCountInString(name) <= maxNameRunes {
		return name
	}
	return string([]rune(name)[:maxNameRunes])
}

type Repository interface {
	FindByManagerID(ctx context.Context, managerID bson.ObjectID) ([]applicationrepository.Application, error)
	CountByManagerID(ctx context.Context, managerID bson.ObjectID) (int64, error)
	Insert(ctx context.Context, application *applicationrepository.Application) error
	FindByID(ctx context.Context, managerID, id bson.ObjectID) (*applicationrepository.Application, error)
	FindByTokenHash(ctx context.Context, hash string) (*applicationrepository.Application, error)
	Update(ctx context.Context, managerID, id bson.ObjectID, input applicationrepository.UpdateInput) error
	Delete(ctx context.Context, managerID, id bson.ObjectID) error
	FindByObjectID(ctx context.Context, id bson.ObjectID) (*applicationrepository.Application, error)
	FindByPageID(ctx context.Context, pageID bson.ObjectID) (*applicationrepository.Application, error)
	DeleteByPageID(ctx context.Context, pageID bson.ObjectID) (*applicationrepository.Application, error)
	AddToken(ctx context.Context, managerID, id bson.ObjectID, token applicationrepository.Token) error
	RemoveToken(ctx context.Context, managerID, id bson.ObjectID, tokenID string) error
	SetTokenRole(ctx context.Context, managerID, id bson.ObjectID, tokenID, role string) error
	SetRoles(ctx context.Context, managerID, id bson.ObjectID, roles []applicationrepository.Role) error
	TouchToken(ctx context.Context, id bson.ObjectID, hash string) error
}

type DocumentRemover interface {
	DeleteByApplicationID(ctx context.Context, applicationID bson.ObjectID) (int64, error)
}

type Service struct {
	repository Repository
	documents  DocumentRemover
}

func NewService(repository Repository, documents DocumentRemover) *Service {
	return &Service{repository: repository, documents: documents}
}

func (s *Service) List(ctx context.Context, managerID bson.ObjectID) ([]applicationrepository.Application, error) {
	applications, err := s.repository.FindByManagerID(ctx, managerID)
	if err != nil {
		return nil, fmt.Errorf("list applications of manager %s: %w", managerID.Hex(), err)
	}
	return applications, nil
}

func (s *Service) CountByManager(ctx context.Context, managerID bson.ObjectID) (int64, error) {
	count, err := s.repository.CountByManagerID(ctx, managerID)
	if err != nil {
		return 0, fmt.Errorf("count applications of manager %s: %w", managerID.Hex(), err)
	}
	return count, nil
}

func (s *Service) Create(ctx context.Context, managerID bson.ObjectID, input CreateInput) (*Created, error) {
	now := time.Now()
	rawToken, token, err := apptoken.Generate(DefaultTokenName, DefaultTokenValidityDays, now)
	if err != nil {
		return nil, fmt.Errorf("generate default token: %w", err)
	}

	allowedOrigins := input.AllowedOrigins
	if allowedOrigins == nil {
		allowedOrigins = []string{"*"}
	}

	allowNonBrowserRequests := input.AllowNonBrowserRequests == nil || *input.AllowNonBrowserRequests

	application := &applicationrepository.Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerID,
		Name:                    input.Name,
		ProjectID:               input.ProjectID,
		Description:             input.Description,
		AllowedOrigins:          allowedOrigins,
		AllowNonBrowserRequests: allowNonBrowserRequests,
		Tokens:                  []applicationrepository.Token{token},
		Roles:                   []applicationrepository.Role{},
		CreatedAt:               now,
		UpdatedAt:               now,
	}

	if err := s.repository.Insert(ctx, application); err != nil {
		return nil, fmt.Errorf("create application %s: %w", input.ProjectID, err)
	}
	return &Created{Application: application, RawToken: rawToken}, nil
}

func (s *Service) GetByID(ctx context.Context, managerID, id bson.ObjectID) (*applicationrepository.Application, error) {
	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return nil, fmt.Errorf("get application %s: %w", id.Hex(), err)
	}
	return application, nil
}

func (s *Service) Update(ctx context.Context, managerID, id bson.ObjectID, input applicationrepository.UpdateInput) error {
	if err := s.repository.Update(ctx, managerID, id, input); err != nil {
		return fmt.Errorf("update application %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) Delete(ctx context.Context, managerID, id bson.ObjectID) error {
	current, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return fmt.Errorf("delete application %s: %w", id.Hex(), err)
	}
	if current.PageID != nil {
		return ErrOwnedByPage
	}
	if err := s.repository.Delete(ctx, managerID, id); err != nil {
		return fmt.Errorf("delete application %s: %w", id.Hex(), err)
	}

	if _, err := s.documents.DeleteByApplicationID(ctx, id); err != nil {
		return fmt.Errorf("delete documents of application %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) CreateToken(ctx context.Context, managerID, id bson.ObjectID, input CreateTokenInput) (*CreatedToken, error) {
	name := input.Name
	if name == "" {
		name = NewTokenName
	}

	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return nil, fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	role := input.Role
	if role == "" {
		role = applicationrepository.AdminRole
	}
	if !application.HasRole(role) {
		return nil, ErrRoleNotFound
	}

	rawToken, token, err := apptoken.Generate(name, input.ValidityDays, time.Now())
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}
	if role != applicationrepository.AdminRole {
		token.Role = role
	}

	if err := s.repository.AddToken(ctx, managerID, id, token); err != nil {
		return nil, fmt.Errorf("add token to application %s: %w", id.Hex(), err)
	}
	return &CreatedToken{Token: token, RawToken: rawToken}, nil
}

func (s *Service) RevokeToken(ctx context.Context, managerID, id bson.ObjectID, tokenID string) error {
	if err := s.repository.RemoveToken(ctx, managerID, id, tokenID); err != nil {
		return fmt.Errorf("revoke token %s: %w", tokenID, err)
	}
	return nil
}

func (s *Service) Authenticate(ctx context.Context, rawToken, origin string) (*applicationrepository.Application, applicationrepository.Token, error) {
	if rawToken == "" {
		return nil, applicationrepository.Token{}, ErrMissingAccessToken
	}

	hash := apptoken.Hash(rawToken)
	application, err := s.repository.FindByTokenHash(ctx, hash)
	if errors.Is(err, ErrApplicationNotFound) {
		return nil, applicationrepository.Token{}, ErrInvalidAccessToken
	}
	if err != nil {
		return nil, applicationrepository.Token{}, fmt.Errorf("find application by token: %w", err)
	}

	token, found := apptoken.Find(application.Tokens, hash)
	if !found {
		return nil, applicationrepository.Token{}, ErrInvalidAccessToken
	}

	if token.IsExpired(time.Now()) {
		return nil, applicationrepository.Token{}, ErrExpiredAccessToken
	}

	if !application.HasRole(token.RoleName()) {
		return nil, applicationrepository.Token{}, ErrRoleNotFound
	}

	if !apptoken.IsOriginAllowed(application.AllowedOrigins, origin, application.AllowNonBrowserRequests) {
		return nil, applicationrepository.Token{}, ErrOriginNotAllowed
	}
	return application, token, nil
}

func (s *Service) Find(ctx context.Context, id bson.ObjectID) (*applicationrepository.Application, error) {
	application, err := s.repository.FindByObjectID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	return application, nil
}

func (s *Service) CreateRole(ctx context.Context, managerID, id bson.ObjectID, input RoleInput) (*applicationrepository.Role, error) {
	if err := roles.CheckName(input.Name); err != nil {
		return nil, err
	}
	if err := roles.CheckRules(input.Rules); err != nil {
		return nil, err
	}

	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return nil, fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	if _, found := application.Role(input.Name); found {
		return nil, ErrRoleTaken
	}
	if len(application.Roles) >= MaxRoles {
		return nil, ErrTooManyRoles
	}

	now := time.Now()
	role := applicationrepository.Role{
		Name:               input.Name,
		Description:        input.Description,
		Rules:              input.Rules,
		IsOwnDocumentsOnly: input.IsOwnDocumentsOnly,
		CreatedAt:          now,
		UpdatedAt:          now,
	}
	if err := s.repository.SetRoles(ctx, managerID, id, append(application.Roles, role)); err != nil {
		return nil, fmt.Errorf("create role %s: %w", input.Name, err)
	}
	return &role, nil
}

func (s *Service) UpdateRole(ctx context.Context, managerID, id bson.ObjectID, name string, input RoleUpdateInput) (*applicationrepository.Role, error) {
	if err := roles.CheckRules(input.Rules); err != nil {
		return nil, err
	}

	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return nil, fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	role, found := application.Role(name)
	if !found {
		return nil, ErrRoleNotFound
	}

	role.Description = input.Description
	role.Rules = input.Rules
	role.IsOwnDocumentsOnly = input.IsOwnDocumentsOnly
	role.UpdatedAt = time.Now()
	if err := s.repository.SetRoles(ctx, managerID, id, application.Roles); err != nil {
		return nil, fmt.Errorf("update role %s: %w", name, err)
	}
	return role, nil
}

func (s *Service) DeleteRole(ctx context.Context, managerID, id bson.ObjectID, name string) error {
	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	if _, found := application.Role(name); !found {
		return ErrRoleNotFound
	}
	for _, token := range application.Tokens {
		if token.Role == name {
			return ErrRoleInUse
		}
	}

	roles := make([]applicationrepository.Role, 0, len(application.Roles))
	for _, role := range application.Roles {
		if role.Name != name {
			roles = append(roles, role)
		}
	}
	if err := s.repository.SetRoles(ctx, managerID, id, roles); err != nil {
		return fmt.Errorf("delete role %s: %w", name, err)
	}
	return nil
}

func (s *Service) SetTokenRole(ctx context.Context, managerID, id bson.ObjectID, tokenID, role string) error {
	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	if !application.HasRole(role) {
		return ErrRoleNotFound
	}
	if role == applicationrepository.AdminRole {
		role = ""
	}
	if err := s.repository.SetTokenRole(ctx, managerID, id, tokenID, role); err != nil {
		return fmt.Errorf("set role of token %s: %w", tokenID, err)
	}
	return nil
}

func (s *Service) TouchToken(ctx context.Context, id bson.ObjectID, hash string) error {
	if err := s.repository.TouchToken(ctx, id, hash); err != nil {
		return fmt.Errorf("touch token of application %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) ExportConfig(ctx context.Context, managerID, id bson.ObjectID) (Config, error) {
	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return Config{}, fmt.Errorf("export config of application %s: %w", id.Hex(), err)
	}
	return NewConfig(application), nil
}

func (s *Service) ApplyConfig(ctx context.Context, managerID, id bson.ObjectID, input ConfigInput) (Config, error) {
	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return Config{}, fmt.Errorf("apply config of application %s: %w", id.Hex(), err)
	}

	planned := *application
	planned.Tokens = slices.Clone(application.Tokens)
	tokenRoles, err := planTokenRoles(&planned, input)
	if err != nil {
		return Config{}, err
	}
	nextRoles := application.Roles
	if input.Roles != nil {
		nextRoles, err = ReplaceRoles(&planned, input.Roles, time.Now())
		if err != nil {
			return Config{}, err
		}
	}

	settings := applicationrepository.UpdateInput{Name: application.Name, Description: application.Description, AllowedOrigins: application.AllowedOrigins, AllowNonBrowserRequests: application.AllowNonBrowserRequests}
	if input.Name != nil {
		settings.Name = *input.Name
	}
	if input.Description != nil {
		settings.Description = *input.Description
	}
	if input.AllowedOrigins != nil {
		settings.AllowedOrigins = input.AllowedOrigins
	}
	if input.AllowNonBrowserRequests != nil {
		settings.AllowNonBrowserRequests = *input.AllowNonBrowserRequests
	}

	if err := s.repository.Update(ctx, managerID, id, settings); err != nil {
		return Config{}, fmt.Errorf("apply config of application %s: %w", id.Hex(), err)
	}
	for tokenID, role := range tokenRoles {
		if err := s.repository.SetTokenRole(ctx, managerID, id, tokenID, role); err != nil {
			return Config{}, fmt.Errorf("apply config of application %s: %w", id.Hex(), err)
		}
	}
	if input.Roles != nil {
		if err := s.repository.SetRoles(ctx, managerID, id, nextRoles); err != nil {
			return Config{}, fmt.Errorf("apply config of application %s: %w", id.Hex(), err)
		}
	}
	return s.ExportConfig(ctx, managerID, id)
}

func planTokenRoles(planned *applicationrepository.Application, input ConfigInput) (map[string]string, error) {
	names := map[string]bool{applicationrepository.AdminRole: true}
	for _, role := range planned.Roles {
		names[role.Name] = true
	}
	if input.Roles != nil {
		names = map[string]bool{applicationrepository.AdminRole: true}
		for _, role := range input.Roles {
			names[role.Name] = true
		}
	}

	changes := map[string]string{}
	for _, wanted := range input.Tokens {
		if _, seen := changes[wanted.ID]; seen {
			return nil, ErrInvalidConfig
		}
		if !names[wanted.Role] {
			return nil, ErrRoleNotFound
		}
		index := slices.IndexFunc(planned.Tokens, func(token applicationrepository.Token) bool { return token.ID == wanted.ID })
		if index < 0 {
			return nil, ErrTokenNotFound
		}
		stored := wanted.Role
		if stored == applicationrepository.AdminRole {
			stored = ""
		}
		changes[wanted.ID] = stored
		planned.Tokens[index].Role = stored
	}
	return changes, nil
}
