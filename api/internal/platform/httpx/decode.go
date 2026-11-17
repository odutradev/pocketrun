package httpx

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

const MaxBodyBytes = 1 << 20

var ErrInvalidBody = errors.New("invalid body")

type ValidationError struct {
	Fields map[string]string
}

func (e *ValidationError) Error() string {
	return "validation failed"
}

type Normalizer interface {
	Normalize()
}

func NewValidator() *validator.Validate {
	validate := validator.New(validator.WithRequiredStructEnabled())
	validate.RegisterTagNameFunc(func(field reflect.StructField) string {
		name, _, _ := strings.Cut(field.Tag.Get("json"), ",")
		if name == "-" {
			return ""
		}
		return name
	})
	return validate
}

func Decode(w http.ResponseWriter, r *http.Request, validate *validator.Validate, payload any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, MaxBodyBytes))
	if err := decoder.Decode(payload); err != nil {
		return fmt.Errorf("%w: %w", ErrInvalidBody, err)
	}

	if normalizer, ok := payload.(Normalizer); ok {
		normalizer.Normalize()
	}

	return validateStruct(validate, payload)
}

func WriteDecodeError(w http.ResponseWriter, err error) {
	var validationError *ValidationError
	if errors.As(err, &validationError) {
		WriteJSON(w, http.StatusBadRequest, ErrorResponse{Error: "validation_failed", Fields: validationError.Fields})
		return
	}
	WriteError(w, http.StatusBadRequest, "invalid_body")
}
