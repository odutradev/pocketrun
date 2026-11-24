package httpx

import (
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strconv"

	"github.com/go-playground/validator/v10"
)

func DecodeQuery(r *http.Request, validate *validator.Validate, payload any) error {
	target := reflect.ValueOf(payload).Elem()
	fields := target.Type()
	values := r.URL.Query()
	invalid := map[string]string{}

	for index := range fields.NumField() {
		field := fields.Field(index)
		name := field.Tag.Get("query")
		raw := values.Get(name)
		if name == "" || raw == "" {
			continue
		}

		switch field.Type.Kind() {
		case reflect.String:
			target.Field(index).SetString(raw)
		case reflect.Int:
			number, err := strconv.Atoi(raw)
			if err != nil {
				invalid[name] = "number"
				continue
			}
			target.Field(index).SetInt(int64(number))
		default:
			return fmt.Errorf("decode query field %s: unsupported kind %s", field.Name, field.Type.Kind())
		}
	}

	if len(invalid) > 0 {
		return &ValidationError{Fields: invalid}
	}
	return validateStruct(validate, payload)
}

func validateStruct(validate *validator.Validate, payload any) error {
	err := validate.Struct(payload)
	var validationErrors validator.ValidationErrors
	if errors.As(err, &validationErrors) {
		fields := make(map[string]string, len(validationErrors))
		for _, fieldError := range validationErrors {
			fields[fieldError.Field()] = fieldError.Tag()
		}
		return &ValidationError{Fields: fields}
	}
	if err != nil {
		return fmt.Errorf("validate payload: %w", err)
	}
	return nil
}
