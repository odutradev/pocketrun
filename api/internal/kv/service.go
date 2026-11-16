package kv

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"

	"pocketrun-api/internal/application"
)

type Repository interface {
	Insert(ctx context.Context, document *Document) error
	Find(ctx context.Context, applicationID bson.ObjectID, collectionName string, query ListQuery) ([]Document, int64, error)
	FindRaw(ctx context.Context, applicationID bson.ObjectID, collectionName string, page, limit int) ([]bson.M, int64, error)
	FindByID(ctx context.Context, applicationID bson.ObjectID, collectionName string, id bson.ObjectID) (*Document, error)
	UpdateData(ctx context.Context, applicationID bson.ObjectID, collectionName string, id bson.ObjectID, data map[string]any) error
	DeleteByID(ctx context.Context, applicationID bson.ObjectID, collectionName string, id bson.ObjectID) error
	DeleteByCollection(ctx context.Context, applicationID bson.ObjectID, collectionName string) (int64, error)
	DeleteByApplicationID(ctx context.Context, applicationID bson.ObjectID) (int64, error)
	DistinctCollections(ctx context.Context, applicationID bson.ObjectID) ([]string, error)
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) Create(ctx context.Context, app *application.Application, collectionName string, input CreateInput) (*Document, error) {
	now := time.Now()
	document := &Document{
		ID:             bson.NewObjectID(),
		ApplicationID:  app.ID,
		ProjectID:      app.ProjectID,
		CollectionName: collectionName,
		Data:           input.Data,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if input.ExpiresInDays > 0 {
		expiresAt := now.AddDate(0, 0, input.ExpiresInDays)
		document.ExpiresAt = &expiresAt
	}

	if err := s.repository.Insert(ctx, document); err != nil {
		return nil, fmt.Errorf("create document in %s: %w", collectionName, err)
	}
	return document, nil
}

func (s *Service) List(ctx context.Context, app *application.Application, collectionName string, query ListQuery) ([]Document, int64, error) {
	documents, total, err := s.repository.Find(ctx, app.ID, collectionName, query)
	if err != nil {
		return nil, 0, fmt.Errorf("list documents in %s: %w", collectionName, err)
	}
	return documents, total, nil
}

func (s *Service) Get(ctx context.Context, app *application.Application, collectionName string, id bson.ObjectID) (*Document, error) {
	document, err := s.repository.FindByID(ctx, app.ID, collectionName, id)
	if err != nil {
		return nil, fmt.Errorf("get document %s: %w", id.Hex(), err)
	}
	return document, nil
}

func (s *Service) Update(ctx context.Context, app *application.Application, collectionName string, id bson.ObjectID, input UpdateInput) error {
	if err := s.repository.UpdateData(ctx, app.ID, collectionName, id, input.Data); err != nil {
		return fmt.Errorf("update document %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) Delete(ctx context.Context, app *application.Application, collectionName string, id bson.ObjectID) error {
	if err := s.repository.DeleteByID(ctx, app.ID, collectionName, id); err != nil {
		return fmt.Errorf("delete document %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) DeleteCollection(ctx context.Context, app *application.Application, collectionName string) (int64, error) {
	deletedCount, err := s.repository.DeleteByCollection(ctx, app.ID, collectionName)
	if err != nil {
		return 0, fmt.Errorf("delete collection %s: %w", collectionName, err)
	}
	return deletedCount, nil
}

func (s *Service) DeleteByApplicationID(ctx context.Context, applicationID bson.ObjectID) (int64, error) {
	deletedCount, err := s.repository.DeleteByApplicationID(ctx, applicationID)
	if err != nil {
		return 0, fmt.Errorf("delete documents of application %s: %w", applicationID.Hex(), err)
	}
	return deletedCount, nil
}

func (s *Service) ListCollections(ctx context.Context, applicationID bson.ObjectID) ([]string, error) {
	collectionNames, err := s.repository.DistinctCollections(ctx, applicationID)
	if err != nil {
		return nil, fmt.Errorf("list collections of application %s: %w", applicationID.Hex(), err)
	}
	return collectionNames, nil
}

func (s *Service) ExploreCollection(ctx context.Context, applicationID bson.ObjectID, collectionName string, page, limit int) (Page[bson.M], error) {
	documents, total, err := s.repository.FindRaw(ctx, applicationID, collectionName, page, limit)
	if err != nil {
		return Page[bson.M]{}, fmt.Errorf("explore collection %s: %w", collectionName, err)
	}
	return NewPage(documents, total, page, limit), nil
}
