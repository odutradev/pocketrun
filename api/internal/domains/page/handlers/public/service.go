package public

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/page/handlers/access"
	"pocketrun-api/internal/domains/page/handlers/binding"
	"pocketrun-api/internal/domains/page/utils/pagerender"
	pagerepository "pocketrun-api/internal/repositories/page"
)

type Dependencies struct {
	Pages    PageOpener
	Guard    AccessGuard
	Data     DataBridge
	PagesURL string
	Validate *validator.Validate
	Logger   *slog.Logger
}

type Service struct {
	data   DataBridge
	logger *slog.Logger
}

func NewService(data DataBridge, logger *slog.Logger) *Service {
	return &Service{data: data, logger: logger}
}

func (s *Service) Render(ctx context.Context, page pagerepository.Page, decision access.Decision) (string, error) {
	body, err := pagerender.Render(page, s.runtimeExtra(ctx, page.ID, decision))
	if err != nil {
		return "", fmt.Errorf("render page %s: %w", page.ID.Hex(), err)
	}
	return body, nil
}

func (s *Service) runtimeExtra(ctx context.Context, id bson.ObjectID, decision access.Decision) pagerender.Extra {
	extra := pagerender.Extra{Access: pagerender.Access{IsProtected: decision.IsProtected}}
	if decision.IsProtected {
		role := decision.Role
		extra.Access.Role = &role
	}

	described, err := s.data.Describe(ctx, id, binding.Subject{IsProtected: decision.IsProtected, PageRole: decision.Role})
	if err != nil {
		s.logger.WarnContext(ctx, "describe page kv", "pageId", id.Hex(), "error", err)
		return extra
	}
	extra.KV = described
	return extra
}
