package config

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/domains/kv/handlers/application"
	"pocketrun-api/internal/domains/kv/utils/roles"
	"pocketrun-api/internal/domains/page/handlers/access"
	"pocketrun-api/internal/domains/page/handlers/binding"
	applicationrepository "pocketrun-api/internal/repositories/application"
	pageaccessrepository "pocketrun-api/internal/repositories/pageaccess"
)

type AccessConfigurer interface {
	Get(ctx context.Context, pageID bson.ObjectID) (*pageaccessrepository.Access, error)
	Configure(ctx context.Context, pageID bson.ObjectID, input access.ConfigInput) (access.Configured, error)
}

type BindingConfigurer interface {
	Details(ctx context.Context, pageID bson.ObjectID) (binding.Details, error)
	Check(ctx context.Context, pageID bson.ObjectID, input binding.ConfigInput) error
	Configure(ctx context.Context, page application.PageInput, input binding.ConfigInput) (binding.Details, error)
}

type ApplicationFinder interface {
	FindForPage(ctx context.Context, pageID bson.ObjectID) (*applicationrepository.Application, error)
}

type Dependencies struct {
	Access       AccessConfigurer
	Bindings     BindingConfigurer
	Applications ApplicationFinder
}

type Service struct {
	access       AccessConfigurer
	bindings     BindingConfigurer
	applications ApplicationFinder
}

func NewService(dependencies Dependencies) *Service {
	return &Service{access: dependencies.Access, bindings: dependencies.Bindings, applications: dependencies.Applications}
}

func (s *Service) Export(ctx context.Context, pageID bson.ObjectID) (Config, error) {
	current, err := s.access.Get(ctx, pageID)
	if err != nil {
		return Config{}, fmt.Errorf("export page config %s: %w", pageID.Hex(), err)
	}
	details, err := s.bindings.Details(ctx, pageID)
	if err != nil {
		return Config{}, fmt.Errorf("export page config %s: %w", pageID.Hex(), err)
	}

	roleList, err := s.roleList(ctx, pageID, details)
	if err != nil {
		return Config{}, fmt.Errorf("export page config %s: %w", pageID.Hex(), err)
	}
	isLinked := details.Binding != nil
	publicRole := defaultRole(roleList, roles.PageRead)
	if isLinked {
		publicRole = details.Binding.PublicRole
	}

	pins := make([]PINConfig, 0, len(current.Keys))
	for _, key := range current.Keys {
		kvRole := defaultRole(roleList, roles.PageWrite)
		if isLinked {
			kvRole = mappedRole(details, key.Role)
		}
		pins = append(pins, PINConfig{Role: key.Role, KVRole: kvRole})
	}

	exported := make([]RoleConfig, 0, len(roleList))
	for _, role := range roleList {
		exported = append(exported, RoleConfig{Name: role.Name, Description: role.Description, IsOwnDocumentsOnly: role.IsOwnDocumentsOnly, Rules: role.Rules})
	}
	return Config{
		Version: Version,
		Access:  AccessConfig{IsEnabled: current.IsEnabled, SessionHours: current.SessionHours, PINs: pins},
		KV:      KVConfig{IsEnabled: isLinked, PublicRole: publicRole, Roles: exported},
	}, nil
}

func (s *Service) Apply(ctx context.Context, page application.PageInput, input Input) (Applied, error) {
	current, err := s.access.Get(ctx, page.PageID)
	if err != nil {
		return Applied{}, fmt.Errorf("apply page config %s: %w", page.PageID.Hex(), err)
	}

	kvInput := binding.ConfigInput{Mappings: map[string]string{}, PageRoles: []string{}}
	accessInput := access.ConfigInput{}
	for _, key := range current.Keys {
		kvInput.PageRoles = append(kvInput.PageRoles, key.Role)
	}
	if input.Access != nil {
		accessInput.IsEnabled = input.Access.IsEnabled
		accessInput.SessionHours = input.Access.SessionHours
		if input.Access.PINs != nil {
			accessInput.Keys = make([]access.ConfigKey, 0, len(input.Access.PINs))
			kvInput.PageRoles = make([]string, 0, len(input.Access.PINs))
			for _, pin := range input.Access.PINs {
				accessInput.Keys = append(accessInput.Keys, access.ConfigKey{Role: pin.Role, PIN: pin.PIN})
				kvInput.PageRoles = append(kvInput.PageRoles, pin.Role)
				if pin.KVRole != nil {
					kvInput.Mappings[pin.Role] = *pin.KVRole
				}
			}
		}
	}
	if input.KV != nil {
		kvInput.IsEnabled = input.KV.IsEnabled
		kvInput.PublicRole = input.KV.PublicRole
		kvInput.Roles = input.KV.Roles
	}

	if err := s.bindings.Check(ctx, page.PageID, kvInput); err != nil {
		return Applied{}, fmt.Errorf("apply page config %s: %w", page.PageID.Hex(), err)
	}
	issued := []access.IssuedPIN{}
	if input.Access != nil {
		configured, err := s.access.Configure(ctx, page.PageID, accessInput)
		if err != nil {
			return Applied{}, fmt.Errorf("apply page config %s: %w", page.PageID.Hex(), err)
		}
		issued = configured.Issued
	}
	if _, err := s.bindings.Configure(ctx, page, kvInput); err != nil {
		return Applied{}, fmt.Errorf("apply page config %s: %w", page.PageID.Hex(), err)
	}

	exported, err := s.Export(ctx, page.PageID)
	if err != nil {
		return Applied{}, err
	}
	return Applied{Config: exported, Issued: issued}, nil
}

func (s *Service) roleList(ctx context.Context, pageID bson.ObjectID, details binding.Details) ([]applicationrepository.Role, error) {
	if details.Application != nil {
		return details.Application.Roles, nil
	}
	app, err := s.applications.FindForPage(ctx, pageID)
	if errors.Is(err, application.ErrApplicationNotFound) {
		return roles.ForPage(time.Now()), nil
	}
	if err != nil {
		return nil, err
	}
	return app.Roles, nil
}

func defaultRole(list []applicationrepository.Role, name string) string {
	for _, role := range list {
		if role.Name == name {
			return name
		}
	}
	return ""
}

func mappedRole(details binding.Details, pageRole string) string {
	for _, mapping := range details.Binding.Roles {
		if mapping.PageRole == pageRole {
			return mapping.KVRole
		}
	}
	return ""
}
