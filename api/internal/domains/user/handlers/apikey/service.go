package apikey

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/user/utils/jwt"
	apikeyrepository "pocketrun-api/internal/repositories/apikey"
	userrepository "pocketrun-api/internal/repositories/user"
)

const touchInterval = time.Minute

type Repository interface {
	Insert(ctx context.Context, key *apikeyrepository.Key) error
	FindByHash(ctx context.Context, hash string) (*apikeyrepository.Key, error)
	ListByUser(ctx context.Context, userID bson.ObjectID) ([]apikeyrepository.Key, error)
	CountByUser(ctx context.Context, userID bson.ObjectID) (int64, error)
	TouchLastUsed(ctx context.Context, id bson.ObjectID, at time.Time) error
	Delete(ctx context.Context, userID, id bson.ObjectID) error
}

type UserFinder interface {
	GetUserByID(ctx context.Context, id bson.ObjectID) (*userrepository.User, error)
}

type Dependencies struct {
	Repository Repository
	Users      UserFinder
	Logger     *slog.Logger
}

type Service struct {
	repository Repository
	users      UserFinder
	logger     *slog.Logger
}

func NewService(deps Dependencies) *Service {
	return &Service{repository: deps.Repository, users: deps.Users, logger: deps.Logger}
}

func (s *Service) List(ctx context.Context, userID bson.ObjectID) ([]apikeyrepository.Key, error) {
	keys, err := s.repository.ListByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("list api keys of user %s: %w", userID.Hex(), err)
	}
	return keys, nil
}

func (s *Service) Create(ctx context.Context, userID bson.ObjectID, input CreateInput) (*Created, error) {
	input.Normalize()
	total, err := s.repository.CountByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("create api key: %w", err)
	}
	if total >= apikeyrepository.MaxKeysPerUser {
		return nil, ErrTooManyKeys
	}

	rawKey, err := generate()
	if err != nil {
		return nil, fmt.Errorf("create api key: %w", err)
	}

	key := &apikeyrepository.Key{
		ID:        bson.NewObjectID(),
		UserID:    userID,
		Name:      input.Name,
		Scope:     input.Scope,
		Hash:      hash(rawKey),
		Prefix:    rawKey[:visiblePrefix] + "...",
		CreatedAt: time.Now(),
	}
	if err := s.repository.Insert(ctx, key); err != nil {
		return nil, fmt.Errorf("create api key: %w", err)
	}
	return &Created{Key: key, RawKey: rawKey}, nil
}

func (s *Service) Delete(ctx context.Context, userID, id bson.ObjectID) error {
	if err := s.repository.Delete(ctx, userID, id); err != nil {
		return fmt.Errorf("delete api key %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) Authenticate(ctx context.Context, rawKey string) (*jwt.Claims, apikeyrepository.Scope, error) {
	rawKey = strings.TrimSpace(rawKey)
	if !strings.HasPrefix(rawKey, keyPrefix) {
		return nil, "", ErrInvalidKey
	}

	key, err := s.repository.FindByHash(ctx, hash(rawKey))
	if errors.Is(err, apikeyrepository.ErrNotFound) {
		return nil, "", ErrInvalidKey
	}
	if err != nil {
		return nil, "", fmt.Errorf("authenticate api key: %w", err)
	}

	user, err := s.users.GetUserByID(ctx, key.UserID)
	if errors.Is(err, userrepository.ErrNotFound) {
		return nil, "", ErrInvalidKey
	}
	if err != nil {
		return nil, "", fmt.Errorf("authenticate api key: %w", err)
	}

	s.touch(ctx, key)
	role := user.Role
	if role == "" {
		role = userrepository.RoleAdmin
	}
	claims := &jwt.Claims{UserID: user.ID.Hex(), Email: user.Email, Role: role, Version: user.TokenVersion}
	return claims, key.Scope, nil
}

func (s *Service) touch(ctx context.Context, key *apikeyrepository.Key) {
	now := time.Now()
	if key.LastUsedAt != nil && now.Sub(*key.LastUsedAt) < touchInterval {
		return
	}
	if err := s.repository.TouchLastUsed(ctx, key.ID, now); err != nil {
		s.logger.WarnContext(ctx, "touch api key", "error", err)
	}
}

func generate() (string, error) {
	randomBytes := make([]byte, keyRandomBytes)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("generate api key bytes: %w", err)
	}
	return keyPrefix + hex.EncodeToString(randomBytes), nil
}

func hash(rawKey string) string {
	digest := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(digest[:])
}
