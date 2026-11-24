package slug

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	slugrepository "pocketrun-api/internal/repositories/slug"
)

const (
	randomAlphabet = "abcdefghijkmnpqrstuvwxyz23456789"
	randomAttempts = 5
)

type Repository interface {
	Insert(ctx context.Context, entry *slugrepository.Entry) error
	Find(ctx context.Context, value string) (*slugrepository.Entry, error)
	Delete(ctx context.Context, value string, targetID bson.ObjectID) error
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) Check(ctx context.Context, value string, ownerID *bson.ObjectID) (Availability, error) {
	availability := Availability{Slug: value}
	if err := Validate(value); err != nil {
		availability.Reason = ReasonInvalid
		if errors.Is(err, ErrReservedSlug) {
			availability.Reason = ReasonReserved
		}
		return availability, nil
	}

	entry, err := s.repository.Find(ctx, value)
	if errors.Is(err, ErrSlugNotFound) {
		availability.IsAvailable = true
		return availability, nil
	}
	if err != nil {
		return availability, fmt.Errorf("check slug %s: %w", value, err)
	}

	if ownerID != nil && entry.TargetID == *ownerID {
		availability.IsAvailable = true
		return availability, nil
	}
	availability.Reason = ReasonTaken
	return availability, nil
}

func (s *Service) Find(ctx context.Context, value string) (*slugrepository.Entry, error) {
	entry, err := s.repository.Find(ctx, value)
	if err != nil {
		return nil, fmt.Errorf("find slug %s: %w", value, err)
	}
	return entry, nil
}

func (s *Service) Reserve(ctx context.Context, value string, kind slugrepository.Kind, targetID bson.ObjectID) error {
	if err := Validate(value); err != nil {
		return fmt.Errorf("reserve slug %s: %w", value, err)
	}

	entry := &slugrepository.Entry{Slug: value, Kind: kind, TargetID: targetID, CreatedAt: time.Now()}
	if err := s.repository.Insert(ctx, entry); err != nil {
		return fmt.Errorf("reserve slug %s: %w", value, err)
	}
	return nil
}

func (s *Service) ReserveRandom(ctx context.Context, kind slugrepository.Kind, targetID bson.ObjectID) (string, error) {
	for range randomAttempts {
		value, err := Random()
		if err != nil {
			return "", fmt.Errorf("generate random slug: %w", err)
		}

		err = s.Reserve(ctx, value, kind, targetID)
		if errors.Is(err, ErrSlugTaken) || errors.Is(err, ErrReservedSlug) {
			continue
		}
		if err != nil {
			return "", fmt.Errorf("reserve random slug: %w", err)
		}
		return value, nil
	}
	return "", fmt.Errorf("reserve random slug: %w", ErrSlugTaken)
}

func (s *Service) Release(ctx context.Context, value string, targetID bson.ObjectID) error {
	if err := s.repository.Delete(ctx, value, targetID); err != nil {
		return fmt.Errorf("release slug %s: %w", value, err)
	}
	return nil
}

func Random() (string, error) {
	bytes := make([]byte, RandomLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generate random slug: %w", err)
	}

	for index, value := range bytes {
		bytes[index] = randomAlphabet[int(value)%len(randomAlphabet)]
	}
	return string(bytes), nil
}
