package application

import "context"

type applicationKey struct{}

func WithApplication(ctx context.Context, application *Application) context.Context {
	return context.WithValue(ctx, applicationKey{}, application)
}

func FromContext(ctx context.Context) (*Application, bool) {
	application, ok := ctx.Value(applicationKey{}).(*Application)
	return application, ok
}
