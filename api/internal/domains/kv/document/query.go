package document

import (
	"fmt"
	"net/url"
	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

const operatorSeparator = "__"

var (
	fieldPattern      = regexp.MustCompile(`^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$`)
	collectionPattern = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)
	reservedParams    = map[string]bool{
		"page": true, "limit": true, "pagination": true, "sortBy": true, "sortOrder": true,
		"createdAfter": true, "createdBefore": true, "format": true,
	}
	comparisonOperators = map[string]string{
		"ne": "$ne", "gt": "$gt", "gte": "$gte", "lt": "$lt", "lte": "$lte",
	}
	metadataSortFields = map[string]string{
		"createdAt": "createdAt", "updatedAt": "updatedAt", "lastUpdate": "updatedAt", "expiresAt": "expiresAt",
	}
)

func CheckCollection(name string) error {
	if name == "" || len(name) > MaxCollectionLength || !collectionPattern.MatchString(name) {
		return ErrInvalidCollection
	}
	return nil
}

func checkWritableCollection(name string) error {
	if err := CheckCollection(name); err != nil {
		return err
	}
	if strings.EqualFold(name, ReservedCollection) {
		return ErrReservedCollection
	}
	return nil
}

func checkField(field string) error {
	if len(field) > MaxFieldLength || !fieldPattern.MatchString(field) {
		return ErrInvalidField
	}
	return nil
}

func ParseListQuery(values url.Values) (kvdocumentrepository.ListQuery, error) {
	filter, err := ParseQueryFilter(values)
	if err != nil {
		return kvdocumentrepository.ListQuery{}, err
	}

	sortField, err := parseSortField(values.Get("sortBy"))
	if err != nil {
		return kvdocumentrepository.ListQuery{}, err
	}

	sortOrder := -1
	switch strings.ToLower(values.Get("sortOrder")) {
	case "", "desc":
	case "asc":
		sortOrder = 1
	default:
		return kvdocumentrepository.ListQuery{}, ErrInvalidSort
	}

	return kvdocumentrepository.ListQuery{
		Filter:    filter,
		SortField: sortField,
		SortOrder: sortOrder,
		Page:      parsePositive(values.Get("page"), 1, 0),
		Limit:     parsePositive(values.Get("limit"), DefaultListLimit, MaxListLimit),
		Paginate:  values.Get("pagination") == "true" || values.Has("page") || values.Has("limit"),
	}, nil
}

func ParseQueryFilter(values url.Values) (bson.M, error) {
	filter := bson.M{}
	for key, keyValues := range values {
		if reservedParams[key] || len(keyValues) == 0 {
			continue
		}
		if err := addCondition(filter, key, parseQueryValue(keyValues[0])); err != nil {
			return nil, err
		}
	}

	createdAt := bson.M{}
	if raw := values.Get("createdAfter"); raw != "" {
		after, err := parseDate(raw)
		if err != nil {
			return nil, ErrInvalidFilter
		}
		createdAt["$gte"] = after
	}
	if raw := values.Get("createdBefore"); raw != "" {
		before, err := parseDate(raw)
		if err != nil {
			return nil, ErrInvalidFilter
		}
		createdAt["$lte"] = before
	}
	if len(createdAt) > 0 {
		filter["createdAt"] = createdAt
	}
	return filter, nil
}

func ParseBodyFilter(filters map[string]any) (bson.M, error) {
	filter := bson.M{}
	for key, value := range filters {
		if err := addCondition(filter, key, value); err != nil {
			return nil, err
		}
	}
	return filter, nil
}

func addCondition(filter bson.M, key string, value any) error {
	field, operator, _ := strings.Cut(strings.TrimPrefix(key, "data."), operatorSeparator)
	if err := checkField(field); err != nil {
		return ErrInvalidFilter
	}

	target := "data." + field
	condition, err := buildCondition(operator, value)
	if err != nil {
		return err
	}

	current, exists := filter[target]
	if !exists {
		filter[target] = condition
		return nil
	}
	merged, currentIsMap := current.(bson.M)
	next, nextIsMap := condition.(bson.M)
	if !currentIsMap || !nextIsMap {
		return ErrInvalidFilter
	}
	for operatorKey, operatorValue := range next {
		merged[operatorKey] = operatorValue
	}
	return nil
}

func buildCondition(operator string, value any) (any, error) {
	switch operator {
	case "", "eq":
		return value, nil
	case "contains":
		text, ok := value.(string)
		if !ok || text == "" || len(text) > MaxContainsLength {
			return nil, ErrInvalidFilter
		}
		return bson.M{"$regex": regexp.QuoteMeta(text), "$options": "i"}, nil
	case "exists":
		exists, ok := value.(bool)
		if !ok {
			return nil, ErrInvalidFilter
		}
		return bson.M{"$exists": exists}, nil
	}

	mongoOperator, ok := comparisonOperators[operator]
	if !ok {
		return nil, ErrInvalidFilter
	}
	return bson.M{mongoOperator: value}, nil
}

func parseQueryValue(raw string) any {
	if len(raw) >= 2 && strings.HasPrefix(raw, `"`) && strings.HasSuffix(raw, `"`) {
		return raw[1 : len(raw)-1]
	}
	if raw == "null" {
		return nil
	}
	if boolean, err := strconv.ParseBool(raw); err == nil {
		return boolean
	}
	if number, err := strconv.ParseFloat(raw, 64); err == nil {
		return number
	}
	return raw
}

func parseSortField(raw string) (string, error) {
	if raw == "" {
		return "createdAt", nil
	}
	if field, ok := metadataSortFields[raw]; ok {
		return field, nil
	}
	field := strings.TrimPrefix(raw, "data.")
	if err := checkField(field); err != nil {
		return "", ErrInvalidSort
	}
	return "data." + field, nil
}

func parseDate(raw string) (time.Time, error) {
	if date, err := time.Parse(time.RFC3339, raw); err == nil {
		return date, nil
	}
	date, err := time.Parse(time.DateOnly, raw)
	if err != nil {
		return time.Time{}, fmt.Errorf("parse date %q: %w", raw, err)
	}
	return date, nil
}

func parsePositive(raw string, fallback, maximum int) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 || (maximum > 0 && value > maximum) {
		return fallback
	}
	return value
}

func ParseExportFormat(raw string) (ExportFormat, error) {
	switch ExportFormat(strings.ToLower(raw)) {
	case "", ExportJSON:
		return ExportJSON, nil
	case ExportCSV:
		return ExportCSV, nil
	}
	return "", ErrInvalidFormat
}
