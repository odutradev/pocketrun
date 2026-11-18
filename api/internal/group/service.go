package group

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Repository interface {
	FindByKind(ctx context.Context, kind Kind) ([]Group, error)
	FindByID(ctx context.Context, kind Kind, id bson.ObjectID) (*Group, error)
	Insert(ctx context.Context, group *Group) error
	Update(ctx context.Context, kind Kind, id bson.ObjectID, input Input) (*Group, error)
	Delete(ctx context.Context, kind Kind, id bson.ObjectID) error
}

type Detacher interface {
	DetachGroup(ctx context.Context, groupID bson.ObjectID) error
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context, kind Kind) ([]Group, error) {
	groups, err := s.repository.FindByKind(ctx, kind)
	if err != nil {
		return nil, fmt.Errorf("list %s groups: %w", kind, err)
	}

	for index := range groups {
		groups[index].applyDefaults()
	}
	return groups, nil
}

func (s *Service) Ensure(ctx context.Context, kind Kind, id bson.ObjectID) error {
	if _, err := s.repository.FindByID(ctx, kind, id); err != nil {
		return fmt.Errorf("ensure group %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) Create(ctx context.Context, kind Kind, input Input) (*Group, error) {
	now := time.Now()
	group := &Group{ID: bson.NewObjectID(), Kind: kind, Name: input.Name, Color: input.Color, Icon: input.Icon, CreatedAt: now, UpdatedAt: now}
	group.applyDefaults()
	if err := s.repository.Insert(ctx, group); err != nil {
		return nil, fmt.Errorf("create %s group: %w", kind, err)
	}
	return group, nil
}

func (s *Service) Update(ctx context.Context, kind Kind, id bson.ObjectID, input Input) (*Group, error) {
	group, err := s.repository.Update(ctx, kind, id, input)
	if err != nil {
		return nil, fmt.Errorf("update group %s: %w", id.Hex(), err)
	}

	group.applyDefaults()
	return group, nil
}

func (s *Service) Delete(ctx context.Context, kind Kind, id bson.ObjectID, members Detacher) error {
	if err := s.repository.Delete(ctx, kind, id); err != nil {
		return fmt.Errorf("delete group %s: %w", id.Hex(), err)
	}

	if err := members.DetachGroup(ctx, id); err != nil {
		return fmt.Errorf("detach group %s: %w", id.Hex(), err)
	}
	return nil
}
