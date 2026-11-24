package usage

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	kvusagerepository "pocketrun-api/internal/repositories/kvusage"
)

const (
	usageRecordWindow = 5 * time.Second
)

type Hour = kvusagerepository.Hour

type Repository interface {
	Increment(ctx context.Context, applicationID, managerID bson.ObjectID, hour time.Time) error
	Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]Hour, error)
}

type Service struct {
	repository Repository
	logger     *slog.Logger
}

func NewService(repository Repository, logger *slog.Logger) *Service {
	return &Service{repository: repository, logger: logger}
}

func (s *Service) Record(ctx context.Context, applicationID, managerID bson.ObjectID) {
	hour := time.Now().UTC().Truncate(time.Hour)
	recordContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), usageRecordWindow)
	go func() {
		defer cancel()
		if err := s.repository.Increment(recordContext, applicationID, managerID, hour); err != nil {
			s.logger.WarnContext(recordContext, "record kv usage", "applicationId", applicationID.Hex(), "error", err)
		}
	}()
}

func (s *Service) Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]Hour, error) {
	hours, err := s.repository.Between(ctx, managerID, from, to)
	if err != nil {
		return nil, fmt.Errorf("list kv usage of manager %s: %w", managerID.Hex(), err)
	}
	return hours, nil
}
