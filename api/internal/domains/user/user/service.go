package user

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	loginattemptrepository "pocketrun-api/internal/repositories/loginattempt"
	userrepository "pocketrun-api/internal/repositories/user"
)

type Repository interface {
	Count(ctx context.Context) (int64, error)
	Insert(ctx context.Context, user *userrepository.User) error
	FindByEmail(ctx context.Context, email string) (*userrepository.User, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*userrepository.User, error)
	FindAll(ctx context.Context) ([]userrepository.User, error)
	Update(ctx context.Context, id bson.ObjectID, fields bson.M) error
	IncrementTokenVersion(ctx context.Context, id bson.ObjectID) error
	Delete(ctx context.Context, id bson.ObjectID) error
}

type AttemptRepository interface {
	Insert(ctx context.Context, attempt *loginattemptrepository.Attempt) error
	Count(ctx context.Context, filter loginattemptrepository.Filter) (int64, error)
	DeleteByEmail(ctx context.Context, email string) error
}

type ApplicationCounter interface {
	CountByManager(ctx context.Context, managerID bson.ObjectID) (int64, error)
}

type Dependencies struct {
	Repository   Repository
	Attempts     AttemptRepository
	Signer       *TokenSigner
	Applications ApplicationCounter
	Logger       *slog.Logger
}

type Service struct {
	repository   Repository
	attempts     AttemptRepository
	signer       *TokenSigner
	applications ApplicationCounter
	logger       *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository:   dependencies.Repository,
		attempts:     dependencies.Attempts,
		signer:       dependencies.Signer,
		applications: dependencies.Applications,
		logger:       dependencies.Logger,
	}
}

func (s *Service) Count(ctx context.Context) (int64, error) {
	count, err := s.repository.Count(ctx)
	if err != nil {
		return 0, fmt.Errorf("count users: %w", err)
	}
	return count, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput, role string) (*userrepository.User, error) {
	passwordHash, err := hashPassword(input.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	now := time.Now()
	user := &userrepository.User{
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

func (s *Service) IssueSession(user *userrepository.User) (*Session, error) {
	token, err := s.signer.Sign(user)
	if err != nil {
		return nil, fmt.Errorf("sign token for user %s: %w", user.ID.Hex(), err)
	}
	return &Session{Token: token, User: user}, nil
}

func (s *Service) Login(ctx context.Context, input LoginInput, client string) (*Session, error) {
	now := time.Now()
	clientHash := hashClient(client)
	if err := s.checkLoginLimits(ctx, input.Email, clientHash, now); err != nil {
		return nil, fmt.Errorf("login %s: %w", input.Email, err)
	}

	user, err := s.repository.FindByEmail(ctx, input.Email)
	if errors.Is(err, ErrUserNotFound) {
		burnPasswordCheck(input.Password)
		return nil, s.rejectLogin(ctx, input.Email, clientHash, now)
	}
	if err != nil {
		return nil, fmt.Errorf("find user %s: %w", input.Email, err)
	}

	isValid, needsRehash := checkPassword(input.Password, user.PasswordHash)
	if !isValid {
		return nil, s.rejectLogin(ctx, input.Email, clientHash, now)
	}
	if needsRehash {
		s.upgradePassword(ctx, user, input.Password)
	}
	if err := s.attempts.DeleteByEmail(ctx, input.Email); err != nil {
		s.logger.WarnContext(ctx, "clear login attempts", "error", err)
	}
	return s.IssueSession(user)
}

func (s *Service) CheckSession(ctx context.Context, claims *Claims) error {
	id, err := bson.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return fmt.Errorf("check session: %w", ErrInvalidToken)
	}
	user, err := s.GetUserByID(ctx, id)
	if errors.Is(err, ErrUserNotFound) {
		return fmt.Errorf("check session: %w", ErrInvalidToken)
	}
	if err != nil {
		return fmt.Errorf("check session: %w", err)
	}
	if user.TokenVersion != claims.Version {
		return fmt.Errorf("check session: %w", ErrInvalidToken)
	}
	claims.Email = user.Email
	claims.Role = user.Role
	return nil
}

func (s *Service) RevokeSessions(ctx context.Context, id bson.ObjectID) error {
	if err := s.repository.IncrementTokenVersion(ctx, id); err != nil {
		return fmt.Errorf("revoke sessions of user %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) rejectLogin(ctx context.Context, email, client string, now time.Time) error {
	if err := s.registerLoginFailure(ctx, email, client, now); err != nil {
		return fmt.Errorf("register login failure: %w", err)
	}
	return ErrInvalidCredentials
}

func (s *Service) upgradePassword(ctx context.Context, user *userrepository.User, password string) {
	passwordHash, err := hashPassword(password)
	if err != nil {
		s.logger.WarnContext(ctx, "rehash password", "userId", user.ID.Hex(), "error", err)
		return
	}
	if err := s.repository.Update(ctx, user.ID, bson.M{"passwordHash": passwordHash}); err != nil {
		s.logger.WarnContext(ctx, "rehash password", "userId", user.ID.Hex(), "error", err)
	}
}

func (s *Service) GetUserByID(ctx context.Context, id bson.ObjectID) (*userrepository.User, error) {
	user, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user %s: %w", id.Hex(), err)
	}
	return user, nil
}

func (s *Service) List(ctx context.Context, actorID bson.ObjectID) ([]userrepository.User, error) {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}

	users, err := s.repository.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	return users, nil
}

func (s *Service) CreateByManager(ctx context.Context, actorID bson.ObjectID, input ManageInput) (*userrepository.User, error) {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return s.Create(ctx, CreateInput{Name: input.Name, Email: input.Email, Password: input.Password}, input.Role)
}

func (s *Service) UpdateByManager(ctx context.Context, actorID, id bson.ObjectID, input UpdateInput) (*userrepository.User, error) {
	actor, err := s.requireSuperadmin(ctx, actorID)
	if err != nil {
		return nil, fmt.Errorf("update user %s: %w", id.Hex(), err)
	}

	if id == actorID && input.Role != actor.Role {
		return nil, ErrSelfAction
	}

	target, err := s.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("update user %s: %w", id.Hex(), err)
	}

	fields := bson.M{"name": input.Name, "email": input.Email, "role": input.Role, "updatedAt": time.Now()}
	if input.Password != "" {
		passwordHash, err := hashPassword(input.Password)
		if err != nil {
			return nil, fmt.Errorf("hash password: %w", err)
		}
		fields["passwordHash"] = passwordHash
	}

	if err := s.repository.Update(ctx, id, fields); err != nil {
		return nil, fmt.Errorf("update user %s: %w", id.Hex(), err)
	}
	if input.Password != "" || input.Role != target.Role {
		if err := s.RevokeSessions(ctx, id); err != nil {
			return nil, fmt.Errorf("update user %s: %w", id.Hex(), err)
		}
	}
	return s.GetUserByID(ctx, id)
}

func (s *Service) Remove(ctx context.Context, actorID, id bson.ObjectID) error {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return fmt.Errorf("remove user %s: %w", id.Hex(), err)
	}

	if id == actorID {
		return ErrSelfAction
	}

	count, err := s.applications.CountByManager(ctx, id)
	if err != nil {
		return fmt.Errorf("count applications of user %s: %w", id.Hex(), err)
	}

	if count > 0 {
		return ErrUserHasApplications
	}

	if err := s.repository.Delete(ctx, id); err != nil {
		return fmt.Errorf("remove user %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) UpdateProfile(ctx context.Context, id bson.ObjectID, input ProfileInput) (*userrepository.User, error) {
	fields := bson.M{"name": input.Name, "email": input.Email, "updatedAt": time.Now()}
	if err := s.repository.Update(ctx, id, fields); err != nil {
		return nil, fmt.Errorf("update profile %s: %w", id.Hex(), err)
	}
	return s.GetUserByID(ctx, id)
}

func (s *Service) ChangePassword(ctx context.Context, id bson.ObjectID, input PasswordInput) (*Session, error) {
	user, err := s.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("change password: %w", err)
	}

	if isValid, _ := checkPassword(input.CurrentPassword, user.PasswordHash); !isValid {
		return nil, ErrInvalidPassword
	}

	passwordHash, err := hashPassword(input.NewPassword)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	fields := bson.M{"passwordHash": passwordHash, "updatedAt": time.Now()}
	if err := s.repository.Update(ctx, id, fields); err != nil {
		return nil, fmt.Errorf("change password of user %s: %w", id.Hex(), err)
	}
	if err := s.RevokeSessions(ctx, id); err != nil {
		return nil, fmt.Errorf("change password: %w", err)
	}

	updated, err := s.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("change password: %w", err)
	}
	return s.IssueSession(updated)
}

func (s *Service) EnsureSuperadmin(ctx context.Context, actorID bson.ObjectID) error {
	if _, err := s.requireSuperadmin(ctx, actorID); err != nil {
		return err
	}
	return nil
}

func (s *Service) requireSuperadmin(ctx context.Context, actorID bson.ObjectID) (*userrepository.User, error) {
	actor, err := s.GetUserByID(ctx, actorID)
	if err != nil {
		return nil, fmt.Errorf("require superadmin: %w", err)
	}

	if actor.Role != RoleSuperadmin {
		return nil, ErrForbidden
	}
	return actor, nil
}

type loginLimit struct {
	window time.Duration
	max    int64
}

func emailLimits() []loginLimit {
	return []loginLimit{{window: 15 * time.Minute, max: 5}, {window: time.Hour, max: 10}, {window: loginattemptrepository.Retention, max: 20}}
}

func clientLimits() []loginLimit {
	return []loginLimit{{window: 15 * time.Minute, max: 20}, {window: time.Hour, max: 50}, {window: loginattemptrepository.Retention, max: 100}}
}

func hashClient(client string) string {
	sum := sha256.Sum256([]byte("login-client\x00" + client))
	return hex.EncodeToString(sum[:16])
}

func (s *Service) checkLoginLimits(ctx context.Context, email, client string, now time.Time) error {
	checks := []struct {
		filter loginattemptrepository.Filter
		limits []loginLimit
	}{
		{filter: loginattemptrepository.Filter{Email: email}, limits: emailLimits()},
		{filter: loginattemptrepository.Filter{Client: client}, limits: clientLimits()},
	}

	for _, check := range checks {
		for _, current := range check.limits {
			filter := check.filter
			filter.Since = now.Add(-current.window)
			failures, err := s.attempts.Count(ctx, filter)
			if err != nil {
				return err
			}
			if failures >= current.max {
				return ErrTooManyAttempts
			}
		}
	}
	return nil
}

func (s *Service) registerLoginFailure(ctx context.Context, email, client string, now time.Time) error {
	return s.attempts.Insert(ctx, &loginattemptrepository.Attempt{ID: bson.NewObjectID(), Email: email, Client: client, At: now})
}
