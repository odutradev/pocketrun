package kv

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	UsageRetention    = 400 * 24 * time.Hour
	usageRecordWindow = 5 * time.Second
)

type UsageHour struct {
	ApplicationID bson.ObjectID `bson:"applicationId"`
	ManagerID     bson.ObjectID `bson:"managerId"`
	Hour          time.Time     `bson:"hour"`
	Requests      int64         `bson:"requests"`
}

type UsageRepository interface {
	Increment(ctx context.Context, applicationID, managerID bson.ObjectID, hour time.Time) error
	Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]UsageHour, error)
}

type UsageService struct {
	repository UsageRepository
	logger     *slog.Logger
}

func NewUsageService(repository UsageRepository, logger *slog.Logger) *UsageService {
	return &UsageService{repository: repository, logger: logger}
}

func (s *UsageService) Record(ctx context.Context, applicationID, managerID bson.ObjectID) {
	hour := time.Now().UTC().Truncate(time.Hour)
	recordContext, cancel := context.WithTimeout(context.WithoutCancel(ctx), usageRecordWindow)
	go func() {
		defer cancel()
		if err := s.repository.Increment(recordContext, applicationID, managerID, hour); err != nil {
			s.logger.WarnContext(recordContext, "record kv usage", "applicationId", applicationID.Hex(), "error", err)
		}
	}()
}

func (s *UsageService) Between(ctx context.Context, managerID bson.ObjectID, from, to time.Time) ([]UsageHour, error) {
	hours, err := s.repository.Between(ctx, managerID, from, to)
	if err != nil {
		return nil, fmt.Errorf("list kv usage of manager %s: %w", managerID.Hex(), err)
	}
	return hours, nil
}
