package appauth

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	applicationrepository "pocketrun-api/internal/repositories/application"
)

type applicationKey struct{}

type grant struct {
	application *applicationrepository.Application
	role        string
}

const touchTimeout = 5 * time.Second

type Authenticator interface {
	Authenticate(ctx context.Context, rawToken, origin string) (*applicationrepository.Application, applicationrepository.Token, error)
	TouchToken(ctx context.Context, id bson.ObjectID, hash string) error
}
