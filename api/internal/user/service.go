package user

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Repository interface {
	Count(ctx context.Context) (int64, error)
	Insert(ctx context.Context, user *User) error
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*User, error)
	FindAll(ctx context.Context) ([]User, error)
	Update(ctx context.Context, id bson.ObjectID, fields bson.M) error
	Delete(ctx context.Context, id bson.ObjectID) error
}

type ApplicationCounter interface {
	CountByManager(ctx context.Context, managerID bson.ObjectID) (int64, error)
}

type Service struct {
	repository   Repository
	signer       *TokenSigner
	applications ApplicationCounter
}

func NewService(repository Repository, signer *TokenSigner, applications ApplicationCounter) *Service {
	return &Service{repository: repository, signer: signer, applications: applications}
}

func (s *Service) Count(ctx context.Context) (int64, error) {
	count, err := s.repository.Count(ctx)
	if err != nil {
		return 0, fmt.Errorf("count users: %w", err)
	}
	return count, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput, role string) (*User, error) {
	passwordHash, err := hashPassword(input.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	now := time.Now()
	user := &User{
		ID:           bson.NewObjectID(),
		Name:         input.Name,
		Email:        input.Email,
		Role:         role,
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.repository.Insert(ctx, user); err != nil {
		return nil, fmt.Errorf("create user %s: %w", input.Email, err)
	}
	return user, nil
}

func (s *Service) IssueSession(user *User) (*Session, error) {
	token, err := s.signer.Sign(user)
	if err != nil {
		return nil, fmt.Errorf("sign token for user %s: %w", user.ID.Hex(), err)
	}
	return &Session{Token: token, User: user}, nil
}

func (s *Service) Login(ctx context.Context, input LoginInput) (*Session, error) {
	user, err := s.repository.FindByEmail(ctx, input.Email)
	if errors.Is(err, ErrUserNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, fmt.Errorf("find user %s: %w", input.Email, err)
	}

	if !checkPassword(input.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}
	return s.IssueSession(user)
}

func (s *Service) GetUserByID(ctx context.Context, id bson.ObjectID) (*User, error) {
	user, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user %s: %w", id.Hex(), err)
	}
	return user, nil
}

func (s *Service) List(ctx context.Context, actorID bson.ObjectID) ([]User, error) {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}

	users, err := s.repository.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	return users, nil
}

func (s *Service) CreateByManager(ctx context.Context, actorID bson.ObjectID, input ManageInput) (*User, error) {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return s.Create(ctx, CreateInput{Name: input.Name, Email: input.Email, Password: input.Password}, input.Role)
}

func (s *Service) UpdateByManager(ctx context.Context, actorID, id bson.ObjectID, input UpdateInput) (*User, error) {
	actor, err := s.requireSuperadmin(ctx, actorID)
	if err != nil {
		return nil, fmt.Errorf("update user %s: %w", id.Hex(), err)
	}

	if id == actorID && input.Role != actor.Role {
		return nil, ErrSelfAction
	}

	fields := bson.M{"name": input.Name, "email": input.Email, "role": input.Role, "updatedAt": time.Now()}
	if input.Password != "" {
		passwordHash, err := hashPassword(input.Password)
		if err != nil {
			return nil, fmt.Errorf("hash password: %w", err)
		}
		fields["passwordHash"] = passwordHash
	}

	if err := s.repository.Update(ctx, id, fields); err != nil {
		return nil, fmt.Errorf("update user %s: %w", id.Hex(), err)
	}
	return s.GetUserByID(ctx, id)
}

func (s *Service) Remove(ctx context.Context, actorID, id bson.ObjectID) error {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return fmt.Errorf("remove user %s: %w", id.Hex(), err)
	}

	if id == actorID {
		return ErrSelfAction
	}

	count, err := s.applications.CountByManager(ctx, id)
	if err != nil {
		return fmt.Errorf("count applications of user %s: %w", id.Hex(), err)
	}

	if count > 0 {
		return ErrUserHasApplications
	}

	if err := s.repository.Delete(ctx, id); err != nil {
		return fmt.Errorf("remove user %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) UpdateProfile(ctx context.Context, id bson.ObjectID, input ProfileInput) (*User, error) {
	fields := bson.M{"name": input.Name, "email": input.Email, "updatedAt": time.Now()}
	if err := s.repository.Update(ctx, id, fields); err != nil {
		return nil, fmt.Errorf("update profile %s: %w", id.Hex(), err)
	}
	return s.GetUserByID(ctx, id)
}

func (s *Service) ChangePassword(ctx context.Context, id bson.ObjectID, input PasswordInput) error {
	user, err := s.GetUserByID(ctx, id)
	if err != nil {
		return fmt.Errorf("change password: %w", err)
	}

	if !checkPassword(input.CurrentPassword, user.PasswordHash) {
		return ErrInvalidPassword
	}

	passwordHash, err := hashPassword(input.NewPassword)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	fields := bson.M{"passwordHash": passwordHash, "updatedAt": time.Now()}
	if err := s.repository.Update(ctx, id, fields); err != nil {
		return fmt.Errorf("change password of user %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) requireSuperadmin(ctx context.Context, actorID bson.ObjectID) (*User, error) {
	actor, err := s.GetUserByID(ctx, actorID)
	if err != nil {
		return nil, fmt.Errorf("require superadmin: %w", err)
	}

	if actor.Role != RoleSuperadmin {
		return nil, ErrForbidden
	}
	return actor, nil
}
