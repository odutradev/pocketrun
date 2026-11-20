package kv

import (
	"context"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Repository interface {
	Insert(ctx context.Context, document *Document) error
	InsertMany(ctx context.Context, documents []Document) (int64, error)
	Find(ctx context.Context, scope Scope, collectionName string, query ListQuery) ([]Document, int64, error)
	FindAll(ctx context.Context, scope Scope, collectionName string) ([]Document, error)
	Count(ctx context.Context, scope Scope, collectionName string, filter bson.M) (int64, error)
	Aggregate(ctx context.Context, scope Scope, collectionName string, filter bson.M, stages []bson.M) ([]bson.M, error)
	FindRaw(ctx context.Context, applicationID bson.ObjectID, collectionName string, page, limit int) ([]bson.M, int64, error)
	FindByID(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID) (*Document, error)
	Update(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID, set, unset bson.M) (*Document, error)
	DeleteByID(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID) error
	DeleteByCollection(ctx context.Context, scope Scope, collectionName string) (int64, error)
	DeleteByApplicationID(ctx context.Context, applicationID bson.ObjectID) (int64, error)
	DistinctCollections(ctx context.Context, applicationID bson.ObjectID) ([]string, error)
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) Create(ctx context.Context, scope Scope, collectionName string, input CreateInput) (*Document, error) {
	if err := checkWritableCollection(collectionName); err != nil {
		return nil, err
	}
	if err := s.checkCapacity(ctx, scope, collectionName, 1); err != nil {
		return nil, err
	}

	now := time.Now()
	document := &Document{
		ID:             bson.NewObjectID(),
		ApplicationID:  scope.ApplicationID,
		ProjectID:      scope.ProjectID,
		CollectionName: collectionName,
		Data:           input.Data,
		CreatedByRole:  scope.Role,
		ExpiresAt:      expiry(now, input.ExpiresInDays, input.ExpiresAt),
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if err := s.repository.Insert(ctx, document); err != nil {
		return nil, fmt.Errorf("create document in %s: %w", collectionName, err)
	}
	return document, nil
}

func (s *Service) List(ctx context.Context, scope Scope, collectionName string, query ListQuery) ([]Document, int64, error) {
	documents, total, err := s.repository.Find(ctx, scope, collectionName, query)
	if err != nil {
		return nil, 0, fmt.Errorf("list documents in %s: %w", collectionName, err)
	}
	return documents, total, nil
}

func (s *Service) Count(ctx context.Context, scope Scope, collectionName string, filter bson.M) (int64, error) {
	count, err := s.repository.Count(ctx, scope, collectionName, filter)
	if err != nil {
		return 0, fmt.Errorf("count documents in %s: %w", collectionName, err)
	}
	return count, nil
}

func (s *Service) Eval(ctx context.Context, scope Scope, collectionName string, queryFilter bson.M, input EvalInput) (EvalResult, error) {
	bodyFilter, err := ParseBodyFilter(input.Filters)
	if err != nil {
		return EvalResult{}, err
	}
	filter := queryFilter
	for key, value := range bodyFilter {
		filter[key] = value
	}

	field := strings.TrimPrefix(input.Field, "data.")
	if input.Operation != EvalCount {
		if err := checkField(field); err != nil {
			return EvalResult{}, err
		}
	}

	results, err := s.repository.Aggregate(ctx, scope, collectionName, filter, evalStages(input.Operation, "$data."+field))
	if err != nil {
		return EvalResult{}, fmt.Errorf("eval %s in %s: %w", input.Operation, collectionName, err)
	}

	result := EvalResult{Operation: input.Operation, Field: field, Result: emptyEvalResult(input.Operation)}
	if input.Operation == EvalCount {
		result.Field = ""
	}
	if input.Operation == EvalDistinct {
		values := make([]DistinctValue, 0, len(results))
		for _, item := range results {
			values = append(values, DistinctValue{Value: item["_id"], Count: toInt64(item["count"])})
		}
		result.Result = values
		return result, nil
	}
	if len(results) > 0 {
		result.Result = results[0]["result"]
	}
	return result, nil
}

func (s *Service) Get(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID) (*Document, error) {
	document, err := s.repository.FindByID(ctx, scope, collectionName, id)
	if err != nil {
		return nil, fmt.Errorf("get document %s: %w", id.Hex(), err)
	}
	return document, nil
}

func (s *Service) Update(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID, input UpdateInput) (*Document, error) {
	set := bson.M{}
	for key, value := range input.Data {
		if err := checkDataKey(key); err != nil {
			return nil, err
		}
		set["data."+key] = value
	}
	return s.update(ctx, scope, collectionName, id, set, input)
}

func (s *Service) Replace(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID, input UpdateInput) (*Document, error) {
	return s.update(ctx, scope, collectionName, id, bson.M{"data": input.Data}, input)
}

func (s *Service) Delete(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID) error {
	if err := s.repository.DeleteByID(ctx, scope, collectionName, id); err != nil {
		return fmt.Errorf("delete document %s: %w", id.Hex(), err)
	}
	return nil
}

func (s *Service) DeleteCollection(ctx context.Context, scope Scope, collectionName string) (int64, error) {
	deletedCount, err := s.repository.DeleteByCollection(ctx, scope, collectionName)
	if err != nil {
		return 0, fmt.Errorf("delete collection %s: %w", collectionName, err)
	}
	return deletedCount, nil
}

func (s *Service) Export(ctx context.Context, scope Scope, collectionName string) ([]Document, error) {
	documents, err := s.repository.FindAll(ctx, scope, collectionName)
	if err != nil {
		return nil, fmt.Errorf("export %s: %w", collectionName, err)
	}
	return documents, nil
}

func (s *Service) ExportProject(ctx context.Context, scope Scope) (map[string][]Document, error) {
	documents, err := s.repository.FindAll(ctx, scope, "")
	if err != nil {
		return nil, fmt.Errorf("export project %s: %w", scope.ProjectID, err)
	}

	grouped := map[string][]Document{}
	for _, document := range documents {
		grouped[document.CollectionName] = append(grouped[document.CollectionName], document)
	}
	return grouped, nil
}

func (s *Service) Import(ctx context.Context, scope Scope, collectionName string, items []map[string]any) (ImportResult, error) {
	if err := checkWritableCollection(collectionName); err != nil {
		return ImportResult{}, err
	}
	if len(items) > MaxImportItems {
		return ImportResult{}, ErrTooManyItems
	}
	if err := s.checkCapacity(ctx, scope, collectionName, len(items)); err != nil {
		return ImportResult{}, err
	}

	documents, err := importDocuments(scope, collectionName, items, time.Now())
	if err != nil {
		return ImportResult{}, err
	}

	count, err := s.repository.InsertMany(ctx, documents)
	if err != nil {
		return ImportResult{}, fmt.Errorf("import into %s: %w", collectionName, err)
	}
	return ImportResult{Imported: true, Count: count}, nil
}

func (s *Service) ImportProject(ctx context.Context, scope Scope, collections map[string][]map[string]any) (ProjectImportResult, error) {
	now := time.Now()
	total := 0
	documents := []Document{}
	for collectionName, items := range collections {
		if err := checkWritableCollection(collectionName); err != nil {
			return ProjectImportResult{}, err
		}
		total += len(items)
		if total > MaxImportItems {
			return ProjectImportResult{}, ErrTooManyItems
		}

		collectionDocuments, err := importDocuments(scope, collectionName, items, now)
		if err != nil {
			return ProjectImportResult{}, err
		}
		documents = append(documents, collectionDocuments...)
	}

	count, err := s.repository.InsertMany(ctx, documents)
	if err != nil {
		return ProjectImportResult{}, fmt.Errorf("import project %s: %w", scope.ProjectID, err)
	}

	counts := map[string]int64{}
	for collectionName, items := range collections {
		counts[collectionName] = int64(len(items))
	}
	return ProjectImportResult{Imported: true, TotalCount: count, Collections: counts}, nil
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

func (s *Service) update(ctx context.Context, scope Scope, collectionName string, id bson.ObjectID, set bson.M, input UpdateInput) (*Document, error) {
	unset := bson.M{}
	now := time.Now()
	switch {
	case input.ExpiresAt != nil:
		set["expiresAt"] = input.ExpiresAt.UTC()
	case input.ExpiresInDays != nil && *input.ExpiresInDays > 0:
		set["expiresAt"] = now.AddDate(0, 0, *input.ExpiresInDays)
	case input.ExpiresInDays != nil:
		unset["expiresAt"] = ""
	}

	document, err := s.repository.Update(ctx, scope, collectionName, id, set, unset)
	if err != nil {
		return nil, fmt.Errorf("update document %s: %w", id.Hex(), err)
	}
	return document, nil
}

func (s *Service) checkCapacity(ctx context.Context, scope Scope, collectionName string, adding int) error {
	if scope.MaxDocuments <= 0 {
		return nil
	}
	count, err := s.repository.Count(ctx, scope, collectionName, bson.M{})
	if err != nil {
		return fmt.Errorf("check capacity of %s: %w", collectionName, err)
	}
	if count+int64(adding) > int64(scope.MaxDocuments) {
		return ErrCollectionFull
	}
	return nil
}

func evalStages(operation EvalOperation, field string) []bson.M {
	switch operation {
	case EvalCount:
		return []bson.M{{"$group": bson.M{"_id": nil, "result": bson.M{"$sum": 1}}}}
	case EvalDistinct:
		return []bson.M{
			{"$group": bson.M{"_id": field, "count": bson.M{"$sum": 1}}},
			{"$sort": bson.D{{Key: "count", Value: -1}, {Key: "_id", Value: 1}}},
			{"$limit": MaxDistinctValues},
		}
	}
	return []bson.M{{"$group": bson.M{"_id": nil, "result": bson.M{"$" + string(operation): field}}}}
}

func emptyEvalResult(operation EvalOperation) any {
	switch operation {
	case EvalSum, EvalCount:
		return 0
	case EvalDistinct:
		return []DistinctValue{}
	}
	return nil
}

func importDocuments(scope Scope, collectionName string, items []map[string]any, now time.Time) ([]Document, error) {
	documents := make([]Document, 0, len(items))
	for _, item := range items {
		document, err := importDocument(scope, collectionName, item, now)
		if err != nil {
			return nil, err
		}
		documents = append(documents, document)
	}
	return documents, nil
}

func importDocument(scope Scope, collectionName string, item map[string]any, now time.Time) (Document, error) {
	document := Document{
		ID:             bson.NewObjectID(),
		ApplicationID:  scope.ApplicationID,
		ProjectID:      scope.ProjectID,
		CollectionName: collectionName,
		Data:           item,
		CreatedByRole:  scope.Role,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	data, isExported := item["data"].(map[string]any)
	if !isExported {
		return document, nil
	}

	document.Data = data
	createdAt, err := optionalDate(item["createdAt"])
	if err != nil {
		return Document{}, ErrInvalidImport
	}
	if createdAt != nil {
		document.CreatedAt = *createdAt
		document.UpdatedAt = *createdAt
	}

	expiresAt, err := optionalDate(item["expiresAt"])
	if err != nil {
		return Document{}, ErrInvalidImport
	}
	days, err := optionalDays(item["expiresInDays"])
	if err != nil {
		return Document{}, ErrInvalidImport
	}
	document.ExpiresAt = expiry(now, days, expiresAt)
	return document, nil
}

func optionalDate(value any) (*time.Time, error) {
	if value == nil {
		return nil, nil
	}
	text, ok := value.(string)
	if !ok {
		return nil, ErrInvalidImport
	}
	date, err := time.Parse(time.RFC3339, text)
	if err != nil {
		return nil, fmt.Errorf("parse import date: %w", err)
	}
	return &date, nil
}

func optionalDays(value any) (int, error) {
	if value == nil {
		return 0, nil
	}
	number, ok := value.(float64)
	if !ok || number < 0 || number > MaxExpiryDays || number != float64(int(number)) {
		return 0, ErrInvalidImport
	}
	return int(number), nil
}

func expiry(now time.Time, days int, at *time.Time) *time.Time {
	if at != nil {
		expiresAt := at.UTC()
		return &expiresAt
	}
	if days <= 0 {
		return nil
	}
	expiresAt := now.AddDate(0, 0, days)
	return &expiresAt
}

func checkDataKey(key string) error {
	if key == "" || strings.HasPrefix(key, "$") || strings.Contains(key, ".") {
		return ErrInvalidField
	}
	return nil
}

func toInt64(value any) int64 {
	switch number := value.(type) {
	case int32:
		return int64(number)
	case int64:
		return number
	case float64:
		return int64(number)
	}
	return 0
}
