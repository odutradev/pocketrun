package tokens

import (
	"time"
)

type Token struct {
	ID          string     `bson:"id" json:"id"`
	Name        string     `bson:"name" json:"name"`
	TokenHash   string     `bson:"token_hash" json:"-"`
	TokenPrefix string     `bson:"token_prefix" json:"token_prefix"`
	ExpiresAt   *time.Time `bson:"expires_at,omitempty" json:"expires_at"`
	CreatedAt   time.Time  `bson:"created_at" json:"created_at"`
	LastUsedAt  *time.Time `bson:"last_used_at,omitempty" json:"last_used_at"`
}
