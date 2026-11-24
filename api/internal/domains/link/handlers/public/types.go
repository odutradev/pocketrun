package public

import (
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"

	linkrepository "pocketrun-api/internal/repositories/link"
	slugrepository "pocketrun-api/internal/repositories/slug"
	"pocketrun-api/internal/services/traffic"
)

const (
	unavailableHeading = "Link indisponível"
	unavailableMessage = "Este endereço não existe, foi desativado ou já expirou. Confira o link com quem o enviou."
)

type LinkOpener interface {
	Resolve(ctx context.Context, value string) (*slugrepository.Entry, error)
	Open(ctx context.Context, value string, visit traffic.Visit) (*linkrepository.Link, error)
}

type PageServer interface {
	ServePage(w http.ResponseWriter, r *http.Request, id bson.ObjectID)
	UnlockPage(w http.ResponseWriter, r *http.Request, id bson.ObjectID)
	ServeData(w http.ResponseWriter, r *http.Request, id bson.ObjectID, rest string)
	WriteDataError(w http.ResponseWriter, status int, code string)
}
