package link

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/group"
	"pocketrun-api/internal/slug"
)

type Repository interface {
	Find(ctx context.Context, query ListQuery) ([]Link, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*Link, error)
	Insert(ctx context.Context, link *Link) error
	Replace(ctx context.Context, link *Link) error
	Delete(ctx context.Context, id bson.ObjectID) error
	UnsetGroup(ctx context.Context, groupID bson.ObjectID) error
	RegisterOpen(ctx context.Context, id bson.ObjectID, now time.Time) (*Link, error)
}

type SlugRegistry interface {
	Check(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error)
	Find(ctx context.Context, value string) (*slug.Entry, error)
	Reserve(ctx context.Context, value string, kind slug.Kind, targetID bson.ObjectID) error
	ReserveRandom(ctx context.Context, kind slug.Kind, targetID bson.ObjectID) (string, error)
	Release(ctx context.Context, value string, targetID bson.ObjectID) error
}

type GroupChecker interface {
	Ensure(ctx context.Context, kind group.Kind, id bson.ObjectID) error
}

type Service struct {
	repository Repository
	slugs      SlugRegistry
	groups     GroupChecker
}

func NewService(repository Repository, slugs SlugRegistry, groups GroupChecker) *Service {
	return &Service{repository: repository, slugs: slugs, groups: groups}
}

func (s *Service) List(ctx context.Context, query ListQuery) ([]Link, error) {
	links, err := s.repository.Find(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list links: %w", err)
	}

	now := time.Now()
	for index := range links {
		links[index].State = links[index].StateAt(now)
	}
	return links, nil
}

func (s *Service) GetByID(ctx context.Context, id bson.ObjectID) (*Link, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get link %s: %w", id.Hex(), err)
	}
	link.State = link.StateAt(time.Now())
	return link, nil
}

func (s *Service) CheckSlug(ctx context.Context, value string, ownerID *bson.ObjectID) (slug.Availability, error) {
	availability, err := s.slugs.Check(ctx, value, ownerID)
	if err != nil {
		return slug.Availability{}, fmt.Errorf("check link slug: %w", err)
	}
	return availability, nil
}

func (s *Service) Create(ctx context.Context, managerID bson.ObjectID, input Input) (*Link, error) {
	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	link := &Link{
		ID:        bson.NewObjectID(),
		Title:     input.Title,
		URL:       input.URL,
		GroupID:   groupID,
		Mode:      input.Mode,
		StartsAt:  input.StartsAt,
		EndsAt:    input.EndsAt,
		MaxClicks: input.MaxClicks,
		CreatedBy: managerID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	link.Slug, err = s.reserveSlug(ctx, input.Slug, link.ID)
	if err != nil {
		return nil, err
	}

	if err := s.repository.Insert(ctx, link); err != nil {
		return nil, errors.Join(fmt.Errorf("create link: %w", err), s.slugs.Release(ctx, link.Slug, link.ID))
	}
	link.State = link.StateAt(now)
	return link, nil
}

func (s *Service) Update(ctx context.Context, id bson.ObjectID, input Input) (*Link, error) {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
	}

	groupID, err := s.prepareInput(ctx, input)
	if err != nil {
		return nil, err
	}

	previousSlug := link.Slug
	nextSlug := input.Slug
	if nextSlug == "" {
		nextSlug = previousSlug
	}
	if nextSlug != previousSlug {
		if err := s.slugs.Reserve(ctx, nextSlug, slug.KindLink, link.ID); err != nil {
			return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
		}
	}

	link.Title = input.Title
	link.Slug = nextSlug
	link.URL = input.URL
	link.GroupID = groupID
	link.Mode = input.Mode
	link.StartsAt = input.StartsAt
	link.EndsAt = input.EndsAt
	link.MaxClicks = input.MaxClicks
	link.UpdatedAt = time.Now()

	if err := s.repository.Replace(ctx, link); err != nil {
		if nextSlug != previousSlug {
			err = errors.Join(err, s.slugs.Release(ctx, nextSlug, link.ID))
		}
		return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
	}

	if nextSlug != previousSlug {
		if err := s.slugs.Release(ctx, previousSlug, link.ID); err != nil {
			return nil, fmt.Errorf("update link %s: %w", id.Hex(), err)
		}
	}
	link.State = link.StateAt(link.UpdatedAt)
	return link, nil
}

func (s *Service) Delete(ctx context.Context, id bson.ObjectID) error {
	link, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return fmt.Errorf("delete link %s: %w", id.Hex(), err)
	}

	if err := s.repository.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete link %s: %w", id.Hex(), err)
	}

	if err := s.slugs.Release(ctx, link.Slug, link.ID); err != nil {
		return fmt.Errorf("delete link %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) DetachGroup(ctx context.Context, groupID bson.ObjectID) error {
	if err := s.repository.UnsetGroup(ctx, groupID); err != nil {
		return fmt.Errorf("detach links from group %s: %w", groupID.Hex(), err)
	}
	return nil
}

func (s *Service) Open(ctx context.Context, value string) (*Link, error) {
	entry, err := s.slugs.Find(ctx, value)
	if errors.Is(err, slug.ErrSlugNotFound) {
		return nil, ErrLinkNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("open link %s: %w", value, err)
	}

	if entry.Kind != slug.KindLink {
		return nil, ErrLinkNotFound
	}

	link, err := s.repository.RegisterOpen(ctx, entry.TargetID, time.Now())
	if err != nil {
		return nil, fmt.Errorf("open link %s: %w", value, err)
	}
	return link, nil
}

func (s *Service) prepareInput(ctx context.Context, input Input) (*bson.ObjectID, error) {
	if err := input.CheckSchedule(); err != nil {
		return nil, err
	}

	if input.GroupID == "" {
		return nil, nil
	}

	groupID, err := group.ParseID(input.GroupID)
	if err != nil {
		return nil, err
	}

	if err := s.groups.Ensure(ctx, group.KindLinks, groupID); err != nil {
		return nil, fmt.Errorf("resolve link group: %w", err)
	}
	return &groupID, nil
}

func (s *Service) reserveSlug(ctx context.Context, value string, targetID bson.ObjectID) (string, error) {
	if value == "" {
		reserved, err := s.slugs.ReserveRandom(ctx, slug.KindLink, targetID)
		if err != nil {
			return "", fmt.Errorf("reserve link slug: %w", err)
		}
		return reserved, nil
	}

	if err := s.slugs.Reserve(ctx, value, slug.KindLink, targetID); err != nil {
		return "", fmt.Errorf("reserve link slug: %w", err)
	}
	return value, nil
}
