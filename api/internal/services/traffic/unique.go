package traffic

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	uniquevisitorrepository "pocketrun-api/internal/repositories/uniquevisitor"
)

type UniqueRepository interface {
	Insert(ctx context.Context, visit *uniquevisitorrepository.Visit) (bool, error)
	DeleteByTarget(ctx context.Context, targetID bson.ObjectID) error
}

type UniqueRegistry struct {
	repository UniqueRepository
	key        []byte
}

func NewUniqueRegistry(repository UniqueRepository, secret string) *UniqueRegistry {
	return &UniqueRegistry{repository: repository, key: []byte("unique-visitor:" + secret)}
}

func (r *UniqueRegistry) Register(ctx context.Context, targetID bson.ObjectID, visit Visit) (bool, error) {
	isNew, err := r.repository.Insert(ctx, &uniquevisitorrepository.Visit{TargetID: targetID, Visitor: r.fingerprint(targetID, visit), At: time.Now()})
	if err != nil {
		return false, fmt.Errorf("register unique visitor: %w", err)
	}
	return isNew, nil
}

func (r *UniqueRegistry) Forget(ctx context.Context, targetID bson.ObjectID) error {
	if err := r.repository.DeleteByTarget(ctx, targetID); err != nil {
		return fmt.Errorf("forget unique visitors: %w", err)
	}
	return nil
}

func (r *UniqueRegistry) fingerprint(targetID bson.ObjectID, visit Visit) string {
	mac := hmac.New(sha256.New, r.key)
	mac.Write([]byte(targetID.Hex() + "|" + visit.IP + "|" + visit.UserAgent))
	return hex.EncodeToString(mac.Sum(nil))
}
