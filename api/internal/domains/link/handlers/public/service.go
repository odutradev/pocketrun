package public

import (
	"context"
	"fmt"
	"net/url"

	linkrepository "pocketrun-api/internal/repositories/link"
	slugrepository "pocketrun-api/internal/repositories/slug"
	"pocketrun-api/internal/services/traffic"
)

type Service struct {
	links LinkOpener
}

func NewService(links LinkOpener) *Service {
	return &Service{links: links}
}

func (s *Service) Resolve(ctx context.Context, value string) (*slugrepository.Entry, error) {
	entry, err := s.links.Resolve(ctx, value)
	if err != nil {
		return nil, fmt.Errorf("resolve %s: %w", value, err)
	}
	return entry, nil
}

func (s *Service) Open(ctx context.Context, value string, visit traffic.Visit) (*linkrepository.Link, error) {
	opened, err := s.links.Open(ctx, value, visit)
	if err != nil {
		return nil, fmt.Errorf("open %s: %w", value, err)
	}
	return opened, nil
}

func (s *Service) Destination(opened *linkrepository.Link, query url.Values) string {
	return withQuery(opened.URL, query)
}

func withQuery(destination string, query url.Values) string {
	if len(query) == 0 {
		return destination
	}

	target, err := url.Parse(destination)
	if err != nil {
		return destination
	}

	values := target.Query()
	extra := url.Values{}
	hasOverlap := false
	for key, items := range query {
		if values.Has(key) {
			values[key] = items
			hasOverlap = true
			continue
		}
		extra[key] = items
	}

	switch {
	case hasOverlap:
		for key, items := range extra {
			values[key] = items
		}
		target.RawQuery = values.Encode()
	case target.RawQuery == "":
		target.RawQuery = extra.Encode()
	default:
		target.RawQuery = target.RawQuery + "&" + extra.Encode()
	}
	return target.String()
}
