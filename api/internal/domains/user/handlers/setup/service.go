package setup

import (
	"context"
	"fmt"
	"log/slog"
	"sync"

	"pocketrun-api/internal/domains/user/handlers/user"
	userrepository "pocketrun-api/internal/repositories/user"
)

type UserService interface {
	Count(ctx context.Context) (int64, error)
	Create(ctx context.Context, input user.CreateInput, role string) (*userrepository.User, error)
	IssueSession(user *userrepository.User) (*user.Session, error)
}

type Service struct {
	users  UserService
	logger *slog.Logger
	mutex  sync.Mutex
}

func NewService(users UserService, logger *slog.Logger) *Service {
	return &Service{users: users, logger: logger}
}

func (s *Service) GetStatus(ctx context.Context) (Status, error) {
	count, err := s.users.Count(ctx)
	if err != nil {
		return Status{}, fmt.Errorf("get setup status: %w", err)
	}
	return Status{SetupRequired: count == 0, HasUsers: count > 0}, nil
}

func (s *Service) CreateAdmin(ctx context.Context, input user.CreateInput) (*user.Session, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	status, err := s.GetStatus(ctx)
	if err != nil {
		return nil, fmt.Errorf("create admin: %w", err)
	}

	if status.HasUsers {
		return nil, ErrSetupCompleted
	}

	admin, err := s.users.Create(ctx, input, userrepository.RoleSuperadmin)
	if err != nil {
		return nil, fmt.Errorf("create superadmin: %w", err)
	}

	session, err := s.users.IssueSession(admin)
	if err != nil {
		return nil, fmt.Errorf("issue superadmin session: %w", err)
	}

	s.logger.InfoContext(ctx, "superadmin created", "userId", admin.ID.Hex(), "email", admin.Email)
	return session, nil
}

func (s *Service) ReportStatus(ctx context.Context) error {
	count, err := s.users.Count(ctx)
	if err != nil {
		return fmt.Errorf("report setup status: %w", err)
	}

	if count == 0 {
		s.logger.WarnContext(ctx, "initial setup required: open the web console to create the superadmin")
		return nil
	}
	s.logger.InfoContext(ctx, "platform operational", "managers", count)
	return nil
}
