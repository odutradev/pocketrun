package access

import (
	"context"
	"crypto/hmac"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/page/history"
	pageaccessattemptrepository "pocketrun-api/internal/repositories/pageaccessattempt"
	"pocketrun-api/internal/services/slug"
	"pocketrun-api/internal/user"
)

const (
	pageLimitWindow  = time.Hour
	pageLimitMax     = 50
	visitorActorName = "Visitante"
	roleField        = "role"
	sessionField     = "sessionHours"
)

type limit struct {
	window time.Duration
	max    int64
}

func clientLimits() []limit {
	return []limit{{window: 15 * time.Minute, max: 5}, {window: time.Hour, max: 10}, {window: pageaccessattemptrepository.Retention, max: 20}}
}

type Repository interface {
	Find(ctx context.Context, pageID bson.ObjectID) (*Access, error)
	Save(ctx context.Context, access *Access) error
	Delete(ctx context.Context, pageID bson.ObjectID) error
}

type AttemptRepository interface {
	Insert(ctx context.Context, attempt *Attempt) error
	Count(ctx context.Context, pageID bson.ObjectID, client string, since time.Time) (int64, error)
	DeleteAll(ctx context.Context, pageID bson.ObjectID) error
}

type EventRecorder interface {
	Record(ctx context.Context, event *history.Event)
}

type ActorResolver interface {
	Actor(ctx context.Context) (user.Actor, error)
}

type Dependencies struct {
	Repository Repository
	Attempts   AttemptRepository
	History    EventRecorder
	Actors     ActorResolver
	Secret     string
	Logger     *slog.Logger
}

type Service struct {
	repository Repository
	attempts   AttemptRepository
	history    EventRecorder
	actors     ActorResolver
	secrets    secrets
	logger     *slog.Logger
}

func NewService(dependencies Dependencies) *Service {
	return &Service{
		repository: dependencies.Repository,
		attempts:   dependencies.Attempts,
		history:    dependencies.History,
		actors:     dependencies.Actors,
		secrets:    newSecrets(dependencies.Secret),
		logger:     dependencies.Logger,
	}
}

func (s *Service) Get(ctx context.Context, pageID bson.ObjectID) (*Access, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("get page access %s: %w", pageID.Hex(), err)
	}
	return access, nil
}

func (s *Service) SetEnabled(ctx context.Context, pageID bson.ObjectID, isEnabled bool) (*Access, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("set page access %s: %w", pageID.Hex(), err)
	}
	if access.IsEnabled == isEnabled {
		return access, nil
	}
	if isEnabled && len(access.Keys) == 0 {
		return nil, fmt.Errorf("set page access %s: %w", pageID.Hex(), ErrNoKeys)
	}

	access.IsEnabled = isEnabled
	if !isEnabled {
		access.Revision++
	}
	if err := s.save(ctx, access); err != nil {
		return nil, fmt.Errorf("set page access %s: %w", pageID.Hex(), err)
	}

	eventType := history.EventAccessDisabled
	if isEnabled {
		eventType = history.EventAccessEnabled
	}
	s.record(ctx, pageID, eventType, s.actor(ctx), nil)
	return access, nil
}

func (s *Service) SetSessionHours(ctx context.Context, pageID bson.ObjectID, hours int) (*Access, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("set page access session %s: %w", pageID.Hex(), err)
	}
	if access.SessionHours == hours {
		return access, nil
	}

	previous := access.SessionHours
	access.SessionHours = hours
	if err := s.save(ctx, access); err != nil {
		return nil, fmt.Errorf("set page access session %s: %w", pageID.Hex(), err)
	}
	s.record(ctx, pageID, history.EventAccessSessionChanged, s.actor(ctx), []history.Change{{Field: sessionField, From: previous, To: hours}})
	return access, nil
}

func (s *Service) CreateKey(ctx context.Context, pageID bson.ObjectID, input KeyInput) (Issued, error) {
	if err := checkRole(input.Role); err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}

	access, err := s.load(ctx, pageID)
	if err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}
	if len(access.Keys) >= MaxKeys {
		return Issued{}, fmt.Errorf("create page access key: %w", ErrTooManyKeys)
	}
	if err := ensureRoleFree(access, input.Role, nil); err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}

	pin, hash, err := s.resolvePIN(access, input.PIN, nil)
	if err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}
	secret, err := newKeySecret()
	if err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}

	keyID := bson.NewObjectID()
	sealed, err := s.secrets.encryptPIN(pageID, keyID, pin)
	if err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}

	now := time.Now()
	access.Keys = append(access.Keys, Key{ID: keyID, Role: input.Role, PINHash: hash, PINCipher: sealed, IsRevealable: true, Secret: secret, CreatedAt: now, PINUpdatedAt: now})
	isFirstKey := len(access.Keys) == 1 && !access.IsEnabled
	if isFirstKey {
		access.IsEnabled = true
	}
	if err := s.save(ctx, access); err != nil {
		return Issued{}, fmt.Errorf("create page access key: %w", err)
	}

	actor := s.actor(ctx)
	s.record(ctx, pageID, history.EventAccessKeyCreated, actor, []history.Change{{Field: roleField, From: nil, To: input.Role}})
	if isFirstKey {
		s.record(ctx, pageID, history.EventAccessEnabled, actor, nil)
	}
	return Issued{Access: access, PIN: pin}, nil
}

func (s *Service) RenameKey(ctx context.Context, pageID, keyID bson.ObjectID, role string) (*Access, error) {
	if err := checkRole(role); err != nil {
		return nil, fmt.Errorf("rename page access key: %w", err)
	}

	access, err := s.load(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("rename page access key: %w", err)
	}
	key, err := findKey(access, keyID)
	if err != nil {
		return nil, fmt.Errorf("rename page access key: %w", err)
	}
	if key.Role == role {
		return access, nil
	}
	if err := ensureRoleFree(access, role, &keyID); err != nil {
		return nil, fmt.Errorf("rename page access key: %w", err)
	}

	previous := key.Role
	key.Role = role
	if err := s.save(ctx, access); err != nil {
		return nil, fmt.Errorf("rename page access key: %w", err)
	}
	s.record(ctx, pageID, history.EventAccessKeyRenamed, s.actor(ctx), []history.Change{{Field: roleField, From: previous, To: role}})
	return access, nil
}

func (s *Service) ResetPIN(ctx context.Context, pageID, keyID bson.ObjectID, value string) (Issued, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return Issued{}, fmt.Errorf("reset page access pin: %w", err)
	}
	key, err := findKey(access, keyID)
	if err != nil {
		return Issued{}, fmt.Errorf("reset page access pin: %w", err)
	}

	pin, hash, err := s.resolvePIN(access, value, &keyID)
	if err != nil {
		return Issued{}, fmt.Errorf("reset page access pin: %w", err)
	}
	secret, err := newKeySecret()
	if err != nil {
		return Issued{}, fmt.Errorf("reset page access pin: %w", err)
	}
	sealed, err := s.secrets.encryptPIN(pageID, keyID, pin)
	if err != nil {
		return Issued{}, fmt.Errorf("reset page access pin: %w", err)
	}

	key.PINHash = hash
	key.PINCipher = sealed
	key.IsRevealable = true
	key.Secret = secret
	key.PINUpdatedAt = time.Now()
	role := key.Role
	if err := s.save(ctx, access); err != nil {
		return Issued{}, fmt.Errorf("reset page access pin: %w", err)
	}
	s.record(ctx, pageID, history.EventAccessPINReset, s.actor(ctx), []history.Change{{Field: roleField, From: nil, To: role}})
	return Issued{Access: access, PIN: pin}, nil
}

func (s *Service) RevealPIN(ctx context.Context, pageID, keyID bson.ObjectID) (Revealed, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return Revealed{}, fmt.Errorf("reveal page access pin: %w", err)
	}
	key, err := findKey(access, keyID)
	if err != nil {
		return Revealed{}, fmt.Errorf("reveal page access pin: %w", err)
	}
	if key.PINCipher == "" {
		return Revealed{}, fmt.Errorf("reveal page access pin: %w", ErrPINUnavailable)
	}

	pin, err := s.secrets.decryptPIN(pageID, keyID, key.PINCipher)
	if err != nil {
		return Revealed{}, fmt.Errorf("reveal page access pin: %w", err)
	}
	s.record(ctx, pageID, history.EventAccessPINViewed, s.actor(ctx), []history.Change{{Field: roleField, From: nil, To: key.Role}})
	return Revealed{PIN: pin}, nil
}

func (s *Service) RemoveKey(ctx context.Context, pageID, keyID bson.ObjectID) (*Access, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("remove page access key: %w", err)
	}
	key, err := findKey(access, keyID)
	if err != nil {
		return nil, fmt.Errorf("remove page access key: %w", err)
	}
	if access.IsEnabled && len(access.Keys) == 1 {
		return nil, fmt.Errorf("remove page access key: %w", ErrLastKey)
	}

	role := key.Role
	keys := make([]Key, 0, len(access.Keys)-1)
	for _, current := range access.Keys {
		if current.ID != keyID {
			keys = append(keys, current)
		}
	}
	access.Keys = keys
	if err := s.save(ctx, access); err != nil {
		return nil, fmt.Errorf("remove page access key: %w", err)
	}
	s.record(ctx, pageID, history.EventAccessKeyRemoved, s.actor(ctx), []history.Change{{Field: roleField, From: role, To: nil}})
	return access, nil
}

func (s *Service) RevokeSessions(ctx context.Context, pageID bson.ObjectID) (*Access, error) {
	access, err := s.load(ctx, pageID)
	if err != nil {
		return nil, fmt.Errorf("revoke page access sessions: %w", err)
	}

	access.Revision++
	if err := s.save(ctx, access); err != nil {
		return nil, fmt.Errorf("revoke page access sessions: %w", err)
	}
	s.record(ctx, pageID, history.EventAccessRevoked, s.actor(ctx), nil)
	return access, nil
}

func (s *Service) DeleteAll(ctx context.Context, pageID bson.ObjectID) error {
	if err := s.repository.Delete(ctx, pageID); err != nil {
		return fmt.Errorf("delete page access %s: %w", pageID.Hex(), err)
	}
	if err := s.attempts.DeleteAll(ctx, pageID); err != nil {
		return fmt.Errorf("delete page access %s: %w", pageID.Hex(), err)
	}
	return nil
}

func (s *Service) Allow(ctx context.Context, pageID bson.ObjectID, token string) (Decision, error) {
	access, err := s.repository.Find(ctx, pageID)
	if errors.Is(err, errAccessNotFound) {
		return Decision{IsAllowed: true}, nil
	}
	if err != nil {
		return Decision{}, fmt.Errorf("check page access %s: %w", pageID.Hex(), err)
	}
	if !access.IsEnabled {
		return Decision{IsAllowed: true}, nil
	}
	if token == "" {
		return Decision{IsProtected: true}, nil
	}
	key, isValid := s.secrets.verifyToken(access, token, time.Now())
	if !isValid {
		return Decision{IsProtected: true}, nil
	}
	return Decision{IsProtected: true, IsAllowed: true, Role: key.Role}, nil
}

func (s *Service) Unlock(ctx context.Context, pageID bson.ObjectID, pin, client string) (Grant, error) {
	if !pinPattern.MatchString(pin) {
		return Grant{}, ErrInvalidPIN
	}

	access, err := s.repository.Find(ctx, pageID)
	if errors.Is(err, errAccessNotFound) {
		return Grant{}, ErrNotProtected
	}
	if err != nil {
		return Grant{}, fmt.Errorf("unlock page %s: %w", pageID.Hex(), err)
	}
	if !access.IsEnabled {
		return Grant{}, ErrNotProtected
	}

	now := time.Now()
	clientHash := s.secrets.hashClient(pageID, client)
	if err := s.checkLimits(ctx, pageID, clientHash, now); err != nil {
		return Grant{}, fmt.Errorf("unlock page %s: %w", pageID.Hex(), err)
	}

	hash := s.secrets.hashPIN(pageID, pin)
	var match *Key
	for index := range access.Keys {
		if hmac.Equal([]byte(access.Keys[index].PINHash), []byte(hash)) && match == nil {
			match = &access.Keys[index]
		}
	}
	if match == nil {
		s.registerFailure(ctx, pageID, clientHash, now)
		return Grant{}, ErrWrongPIN
	}

	expiresAt := now.Add(sessionDuration(access))
	grant := Grant{Token: s.secrets.issueToken(pageID, *match, access.Revision, now, expiresAt), ExpiresAt: expiresAt, Role: match.Role}
	s.record(ctx, pageID, history.EventUnlocked, user.Actor{Name: visitorActorName}, []history.Change{{Field: roleField, From: nil, To: match.Role}})
	return grant, nil
}

func (s *Service) checkLimits(ctx context.Context, pageID bson.ObjectID, client string, now time.Time) error {
	pageFailures, err := s.attempts.Count(ctx, pageID, "", now.Add(-pageLimitWindow))
	if err != nil {
		return err
	}
	if pageFailures >= pageLimitMax {
		return ErrTooManyAttempts
	}

	for _, current := range clientLimits() {
		failures, err := s.attempts.Count(ctx, pageID, client, now.Add(-current.window))
		if err != nil {
			return err
		}
		if failures >= current.max {
			return ErrTooManyAttempts
		}
	}
	return nil
}

func (s *Service) registerFailure(ctx context.Context, pageID bson.ObjectID, client string, now time.Time) {
	attempt := &Attempt{ID: bson.NewObjectID(), PageID: pageID, Client: client, At: now}
	if err := s.attempts.Insert(ctx, attempt); err != nil {
		s.logger.WarnContext(ctx, "record page access attempt", "pageId", pageID.Hex(), "error", err)
		return
	}

	pageFailures, err := s.attempts.Count(ctx, pageID, "", now.Add(-pageLimitWindow))
	if err != nil {
		s.logger.WarnContext(ctx, "count page access attempts", "pageId", pageID.Hex(), "error", err)
		return
	}
	if pageFailures == pageLimitMax {
		s.record(ctx, pageID, history.EventAccessLocked, user.SystemActor(), nil)
	}
}

func (s *Service) resolvePIN(access *Access, value string, ownerID *bson.ObjectID) (string, string, error) {
	if value != "" {
		if err := checkPIN(value); err != nil {
			return "", "", err
		}
		hash := s.secrets.hashPIN(access.PageID, value)
		if err := ensurePINFree(access, hash, ownerID); err != nil {
			return "", "", err
		}
		return value, hash, nil
	}

	for range maxGenerateTries {
		pin, err := generatePIN()
		if err != nil {
			return "", "", err
		}
		hash := s.secrets.hashPIN(access.PageID, pin)
		if ensurePINFree(access, hash, ownerID) == nil {
			return pin, hash, nil
		}
	}
	return "", "", ErrPINInUse
}

func (s *Service) load(ctx context.Context, pageID bson.ObjectID) (*Access, error) {
	access, err := s.repository.Find(ctx, pageID)
	if errors.Is(err, errAccessNotFound) {
		return newAccess(pageID), nil
	}
	if err != nil {
		return nil, err
	}
	applyAccessDefaults(access)
	return access, nil
}

func (s *Service) save(ctx context.Context, access *Access) error {
	now := time.Now()
	access.UpdatedAt = &now
	return s.repository.Save(ctx, access)
}

func (s *Service) record(ctx context.Context, pageID bson.ObjectID, eventType history.EventType, actor user.Actor, changes []history.Change) {
	s.history.Record(ctx, history.NewEvent(pageID, eventType, actor, changes, time.Now()))
}

func (s *Service) actor(ctx context.Context) user.Actor {
	actor, err := s.actors.Actor(ctx)
	if err != nil {
		s.logger.WarnContext(ctx, "resolve page access actor", "error", err)
	}
	return actor
}

func checkRole(role string) error {
	if role == "" {
		return nil
	}
	if err := slug.CheckFormat(role); err != nil {
		return ErrInvalidRole
	}
	return nil
}
