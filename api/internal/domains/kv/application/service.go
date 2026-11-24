package application

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Repository interface {
	FindByManagerID(ctx context.Context, managerID bson.ObjectID) ([]Application, error)
	CountByManagerID(ctx context.Context, managerID bson.ObjectID) (int64, error)
	Insert(ctx context.Context, application *Application) error
	FindByID(ctx context.Context, managerID, id bson.ObjectID) (*Application, error)
	FindByTokenHash(ctx context.Context, hash string) (*Application, error)
	Update(ctx context.Context, managerID, id bson.ObjectID, input UpdateInput) error
	Delete(ctx context.Context, managerID, id bson.ObjectID) error
	FindByObjectID(ctx context.Context, id bson.ObjectID) (*Application, error)
	FindByPageID(ctx context.Context, pageID bson.ObjectID) (*Application, error)
	DeleteByPageID(ctx context.Context, pageID bson.ObjectID) (*Application, error)
	AddToken(ctx context.Context, managerID, id bson.ObjectID, token Token) error
	RemoveToken(ctx context.Context, managerID, id bson.ObjectID, tokenID string) error
	SetTokenRole(ctx context.Context, managerID, id bson.ObjectID, tokenID, role string) error
	SetRoles(ctx context.Context, managerID, id bson.ObjectID, roles []Role) error
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

func (s *Service) List(ctx context.Context, managerID bson.ObjectID) ([]Application, error) {
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
	rawToken, token, err := generateToken(DefaultTokenName, DefaultTokenValidityDays, now)
	if err != nil {
		return nil, fmt.Errorf("generate default token: %w", err)
	}

	allowedOrigins := input.AllowedOrigins
	if allowedOrigins == nil {
		allowedOrigins = []string{"*"}
	}

	allowNonBrowserRequests := input.AllowNonBrowserRequests == nil || *input.AllowNonBrowserRequests

	application := &Application{
		ID:                      bson.NewObjectID(),
		ManagerID:               managerID,
		Name:                    input.Name,
		ProjectID:               input.ProjectID,
		Description:             input.Description,
		AllowedOrigins:          allowedOrigins,
		AllowNonBrowserRequests: allowNonBrowserRequests,
		Tokens:                  []Token{token},
		Roles:                   []Role{},
		CreatedAt:               now,
		UpdatedAt:               now,
	}

	if err := s.repository.Insert(ctx, application); err != nil {
		return nil, fmt.Errorf("create application %s: %w", input.ProjectID, err)
	}
	return &Created{Application: application, RawToken: rawToken}, nil
}

func (s *Service) GetByID(ctx context.Context, managerID, id bson.ObjectID) (*Application, error) {
	application, err := s.repository.FindByID(ctx, managerID, id)
	if err != nil {
		return nil, fmt.Errorf("get application %s: %w", id.Hex(), err)
	}
	return application, nil
}

func (s *Service) Update(ctx context.Context, managerID, id bson.ObjectID, input UpdateInput) error {
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
		role = AdminRole
	}
	if !application.HasRole(role) {
		return nil, ErrRoleNotFound
	}

	rawToken, token, err := generateToken(name, input.ValidityDays, time.Now())
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}
	if role != AdminRole {
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

func (s *Service) Authenticate(ctx context.Context, rawToken, origin string) (*Application, Token, error) {
	if rawToken == "" {
		return nil, Token{}, ErrMissingAccessToken
	}

	hash := hashToken(rawToken)
	application, err := s.repository.FindByTokenHash(ctx, hash)
	if errors.Is(err, ErrApplicationNotFound) {
		return nil, Token{}, ErrInvalidAccessToken
	}
	if err != nil {
		return nil, Token{}, fmt.Errorf("find application by token: %w", err)
	}

	token, found := findToken(application.Tokens, hash)
	if !found {
		return nil, Token{}, ErrInvalidAccessToken
	}

	if token.IsExpired(time.Now()) {
		return nil, Token{}, ErrExpiredAccessToken
	}

	if !application.HasRole(token.RoleName()) {
		return nil, Token{}, ErrRoleNotFound
	}

	if !isOriginAllowed(application.AllowedOrigins, origin, application.AllowNonBrowserRequests) {
		return nil, Token{}, ErrOriginNotAllowed
	}
	return application, token, nil
}

func (s *Service) Find(ctx context.Context, id bson.ObjectID) (*Application, error) {
	application, err := s.repository.FindByObjectID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find application %s: %w", id.Hex(), err)
	}
	return application, nil
}

func (s *Service) CreateRole(ctx context.Context, managerID, id bson.ObjectID, input RoleInput) (*Role, error) {
	if err := checkRoleName(input.Name); err != nil {
		return nil, err
	}
	if err := checkRules(input.Rules); err != nil {
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
	role := Role{
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

func (s *Service) UpdateRole(ctx context.Context, managerID, id bson.ObjectID, name string, input RoleUpdateInput) (*Role, error) {
	if err := checkRules(input.Rules); err != nil {
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

	roles := make([]Role, 0, len(application.Roles))
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
	if role == AdminRole {
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
