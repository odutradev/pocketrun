package document

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"time"
)

var metadataColumns = []string{"id", "collectionName", "createdAt", "updatedAt", "expiresAt"}

func DocumentsCSV(documents []Document) ([]byte, error) {
	var buffer bytes.Buffer
	if err := writeCSV(&buffer, documents); err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func ProjectCSV(collections map[string][]Document) ([]byte, error) {
	names := make([]string, 0, len(collections))
	for name := range collections {
		names = append(names, name)
	}
	sort.Strings(names)

	var buffer bytes.Buffer
	for index, name := range names {
		if index > 0 {
			buffer.WriteString("\n")
		}
		buffer.WriteString("Collection: " + name + "\n")
		if err := writeCSV(&buffer, collections[name]); err != nil {
			return nil, err
		}
	}
	return buffer.Bytes(), nil
}

func writeCSV(buffer *bytes.Buffer, documents []Document) error {
	keys := dataKeys(documents)
	writer := csv.NewWriter(buffer)
	if err := writer.Write(append(append([]string{}, metadataColumns...), keys...)); err != nil {
		return fmt.Errorf("write csv header: %w", err)
	}

	for _, document := range documents {
		row := []string{document.ID.Hex(), document.CollectionName, formatTime(&document.CreatedAt), formatTime(&document.UpdatedAt), formatTime(document.ExpiresAt)}
		for _, key := range keys {
			cell, err := csvCell(document.Data[key])
			if err != nil {
				return err
			}
			row = append(row, cell)
		}
		if err := writer.Write(row); err != nil {
			return fmt.Errorf("write csv row: %w", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return fmt.Errorf("flush csv: %w", err)
	}
	return nil
}

func dataKeys(documents []Document) []string {
	seen := map[string]bool{}
	keys := []string{}
	for _, document := range documents {
		for key := range document.Data {
			if !seen[key] {
				seen[key] = true
				keys = append(keys, key)
			}
		}
	}
	sort.Strings(keys)
	return keys
}

func csvCell(value any) (string, error) {
	switch typed := value.(type) {
	case nil:
		return "", nil
	case string:
		return neutralizeFormula(typed), nil
	case bool:
		return strconv.FormatBool(typed), nil
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64), nil
	case int32:
		return strconv.FormatInt(int64(typed), 10), nil
	case int64:
		return strconv.FormatInt(typed, 10), nil
	}

	encoded, err := json.Marshal(value)
	if err != nil {
		return "", fmt.Errorf("encode csv cell: %w", err)
	}
	return neutralizeFormula(string(encoded)), nil
}

func neutralizeFormula(text string) string {
	if text != "" && (text[0] == '=' || text[0] == '+' || text[0] == '-' || text[0] == '@') {
		return "'" + text
	}
	return text
}

func formatTime(value *time.Time) string {
	if value == nil {
		return ""
	}
	return value.UTC().Format(time.RFC3339)
}
