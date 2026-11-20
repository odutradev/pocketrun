package application

import "context"

type applicationKey struct{}

type grant struct {
	application *Application
	role        string
}

func WithApplication(ctx context.Context, application *Application, role string) context.Context {
	return context.WithValue(ctx, applicationKey{}, grant{application: application, role: role})
}

func FromContext(ctx context.Context) (*Application, bool) {
	value, ok := ctx.Value(applicationKey{}).(grant)
	return value.application, ok && value.application != nil
}

func RoleFromContext(ctx context.Context) string {
	value, ok := ctx.Value(applicationKey{}).(grant)
	if !ok || value.role == "" {
		return AdminRole
	}
	return value.role
}
