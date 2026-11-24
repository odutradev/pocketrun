package setup

import (
	"context"
	"fmt"
	"log/slog"
	"sync"

	"pocketrun-api/internal/domains/user/handlers/user"
	"pocketrun-api/internal/domains/user/utils/setuptoken"
	userrepository "pocketrun-api/internal/repositories/user"
)

type UserService interface {
	Count(ctx context.Context) (int64, error)
	Create(ctx context.Context, input user.CreateInput, role string) (*userrepository.User, error)
	IssueSession(user *userrepository.User) (*user.Session, error)
}

type Service struct {
	users    UserService
	logger   *slog.Logger
	mutex    sync.Mutex
	token    string
	failures int
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

func (s *Service) VerifyToken(ctx context.Context, token string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.checkToken(ctx, token)
}

func (s *Service) CreateAdmin(ctx context.Context, input CreateAdminInput) (*user.Session, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if err := s.checkToken(ctx, input.SetupToken); err != nil {
		return nil, fmt.Errorf("create admin: %w", err)
	}

	admin, err := s.users.Create(ctx, input.CreateInput, userrepository.RoleSuperadmin)
	if err != nil {
		return nil, fmt.Errorf("create superadmin: %w", err)
	}
	s.token = ""
	s.failures = 0

	session, err := s.users.IssueSession(admin)
	if err != nil {
		return nil, fmt.Errorf("issue superadmin session: %w", err)
	}

	s.logger.InfoContext(ctx, "superadmin created", "userId", admin.ID.Hex(), "email", admin.Email)
	return session, nil
}

func (s *Service) ReportStatus(ctx context.Context) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	count, err := s.users.Count(ctx)
	if err != nil {
		return fmt.Errorf("report setup status: %w", err)
	}

	if count > 0 {
		s.logger.InfoContext(ctx, "platform operational", "managers", count)
		return nil
	}
	if _, err := s.currentToken(ctx); err != nil {
		return fmt.Errorf("report setup status: %w", err)
	}
	return nil
}

func (s *Service) checkToken(ctx context.Context, token string) error {
	status, err := s.GetStatus(ctx)
	if err != nil {
		return fmt.Errorf("check setup token: %w", err)
	}
	if status.HasUsers {
		return ErrSetupCompleted
	}

	expected, err := s.currentToken(ctx)
	if err != nil {
		return fmt.Errorf("check setup token: %w", err)
	}
	if setuptoken.Matches(expected, token) {
		return nil
	}

	s.failures++
	if s.failures < MaxTokenFailures {
		return ErrInvalidSetupToken
	}
	if err := s.rotateToken(ctx); err != nil {
		return fmt.Errorf("check setup token: %w", err)
	}
	return ErrInvalidSetupToken
}

func (s *Service) currentToken(ctx context.Context) (string, error) {
	if s.token != "" {
		return s.token, nil
	}
	if err := s.rotateToken(ctx); err != nil {
		return "", err
	}
	return s.token, nil
}

func (s *Service) rotateToken(ctx context.Context) error {
	token, err := setuptoken.Generate()
	if err != nil {
		return fmt.Errorf("rotate setup token: %w", err)
	}

	isReplacement := s.token != ""
	s.token = token
	s.failures = 0
	if isReplacement {
		s.logger.WarnContext(ctx, "setup token replaced after too many wrong attempts: enter the new token in the web console", "setupToken", token)
		return nil
	}
	s.logger.WarnContext(ctx, "initial setup required: open the web console and enter the setup token to create the superadmin", "setupToken", token)
	return nil
}
