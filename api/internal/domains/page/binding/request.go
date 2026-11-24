package binding

import (
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	kvdocument "pocketrun-api/internal/domains/kv/document"
	pagekvrequestrepository "pocketrun-api/internal/repositories/pagekvrequest"
	"pocketrun-api/internal/services/httpx"
)

type route struct {
	method string
	action pagekvrequestrepository.Action
	hasID  bool
}

var routes = []route{
	{method: http.MethodGet, action: pagekvrequestrepository.ActionList},
	{method: http.MethodGet, action: pagekvrequestrepository.ActionCount},
	{method: http.MethodPost, action: pagekvrequestrepository.ActionEval},
	{method: http.MethodGet, action: pagekvrequestrepository.ActionGet, hasID: true},
	{method: http.MethodPost, action: pagekvrequestrepository.ActionCreate},
	{method: http.MethodPatch, action: pagekvrequestrepository.ActionUpdate, hasID: true},
	{method: http.MethodPut, action: pagekvrequestrepository.ActionReplace, hasID: true},
	{method: http.MethodDelete, action: pagekvrequestrepository.ActionDelete, hasID: true},
}

func ParseRequest(w http.ResponseWriter, r *http.Request, validate *validator.Validate, rest string) (Request, error) {
	parts := strings.Split(strings.Trim(rest, "/"), "/")
	if len(parts) < 2 || len(parts) > 3 {
		return Request{}, ErrUnknownRoute
	}

	matched, ok := matchRoute(r.Method, pagekvrequestrepository.Action(parts[1]), len(parts) == 3)
	if !ok {
		return Request{}, ErrUnknownRoute
	}

	request := Request{Action: matched.action, Collection: parts[0]}
	if err := kvdocument.CheckCollection(request.Collection); err != nil {
		return Request{}, err
	}
	if matched.hasID {
		id, err := bson.ObjectIDFromHex(parts[2])
		if err != nil {
			return Request{}, kvdocument.ErrInvalidDocumentID
		}
		request.DocumentID = id
	}

	if err := decodeAction(w, r, validate, &request); err != nil {
		return Request{}, err
	}
	return request, nil
}

func matchRoute(method string, action pagekvrequestrepository.Action, hasID bool) (route, bool) {
	for _, candidate := range routes {
		if candidate.method == method && candidate.action == action && candidate.hasID == hasID {
			return candidate, true
		}
	}
	return route{}, false
}

func decodeAction(w http.ResponseWriter, r *http.Request, validate *validator.Validate, request *Request) error {
	switch request.Action {
	case pagekvrequestrepository.ActionList:
		query, err := kvdocument.ParseListQuery(r.URL.Query())
		if err != nil {
			return err
		}
		request.List = query
	case pagekvrequestrepository.ActionCount:
		filter, err := kvdocument.ParseQueryFilter(r.URL.Query())
		if err != nil {
			return err
		}
		request.Filter = filter
	case pagekvrequestrepository.ActionEval:
		filter, err := kvdocument.ParseQueryFilter(r.URL.Query())
		if err != nil {
			return err
		}
		request.Filter = filter
		return httpx.DecodeLimited(w, r, validate, &request.Eval, MaxBodyBytes)
	case pagekvrequestrepository.ActionCreate:
		return httpx.DecodeLimited(w, r, validate, &request.Create, MaxBodyBytes)
	case pagekvrequestrepository.ActionUpdate, pagekvrequestrepository.ActionReplace:
		return httpx.DecodeLimited(w, r, validate, &request.Update, MaxBodyBytes)
	}
	return nil
}
