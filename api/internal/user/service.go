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
}

type Service struct {
	repository Repository
	signer     *TokenSigner
}

func NewService(repository Repository, signer *TokenSigner) *Service {
	return &Service{repository: repository, signer: signer}
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

func (s *Service) Register(ctx context.Context) error {
	count, err := s.Count(ctx)
	if err != nil {
		return err
	}

	if count > 0 {
		return ErrRegistrationDisabled
	}
	return ErrSetupRequired
}

func (s *Service) GetUserByID(ctx context.Context, id bson.ObjectID) (*User, error) {
	user, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user %s: %w", id.Hex(), err)
	}
	return user, nil
}
