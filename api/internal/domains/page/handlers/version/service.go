package version

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/page/utils/versionlabel"
	pageversionrepository "pocketrun-api/internal/repositories/pageversion"
	userrepository "pocketrun-api/internal/repositories/user"
)

type Repository interface {
	Insert(ctx context.Context, version *pageversionrepository.Version) error
	Find(ctx context.Context, pageID bson.ObjectID) ([]pageversionrepository.Version, error)
	FindOne(ctx context.Context, pageID bson.ObjectID, number int) (*pageversionrepository.Version, error)
	Prune(ctx context.Context, pageID bson.ObjectID, keepFrom int) error
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type Service struct {
	repository Repository
	logger     *slog.Logger
}

func NewService(repository Repository, logger *slog.Logger) *Service {
	return &Service{repository: repository, logger: logger}
}

func (s *Service) Save(ctx context.Context, version *pageversionrepository.Version) {
	if err := s.repository.Insert(ctx, version); err != nil {
		s.logger.WarnContext(ctx, "save page version", "pageId", version.PageID.Hex(), "number", version.Number, "error", err)
		return
	}
	if version.Number <= MaxKept {
		return
	}
	if err := s.repository.Prune(ctx, version.PageID, version.Number-MaxKept+1); err != nil {
		s.logger.WarnContext(ctx, "prune page versions", "pageId", version.PageID.Hex(), "error", err)
	}
}

func (s *Service) List(ctx context.Context, pageID bson.ObjectID) ([]pageversionrepository.Version, error) {
	versions, err := s.repository.Find(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("page versions %s: %w", pageID.Hex(), err)
	}
	for index := range versions {
		withLabel(&versions[index])
	}
	return versions, nil
}

func (s *Service) Get(ctx context.Context, pageID bson.ObjectID, number int) (*pageversionrepository.Version, error) {
	version, err := s.repository.FindOne(ctx, pageID, number)
	if err != nil {
		return nil, fmt.Errorf("page version %s %d: %w", pageID.Hex(), number, err)
	}
	return withLabel(version), nil
}

func (s *Service) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if err := s.repository.DeleteAll(ctx, pageID); err != nil {
		return fmt.Errorf("delete page versions %s: %w", pageID.Hex(), err)
	}
	return nil
}

func New(pageID bson.ObjectID, number int, html, message string, restoredFrom *int, actor userrepository.Actor, at time.Time) *pageversionrepository.Version {
	return &pageversionrepository.Version{
		ID:           bson.NewObjectID(),
		PageID:       pageID,
		Number:       number,
		HTML:         html,
		Size:         int64(len(html)),
		RestoredFrom: restoredFrom,
		Message:      message,
		Actor:        actor,
		CreatedAt:    at,
	}
}

func withLabel(v *pageversionrepository.Version) *pageversionrepository.Version {
	v.Label = versionlabel.Label(v.Number)
	return v
}
