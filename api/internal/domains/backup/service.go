package backup

import (
	"bufio"
	"compress/gzip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"maps"
	"slices"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Repository interface {
	Count(ctx context.Context, name string) (int64, error)
	Each(ctx context.Context, name string, visit func(document bson.Raw) error) error
	ResetStaging(ctx context.Context, name string) error
	Stage(ctx context.Context, name string, documents []any) error
	Promote(ctx context.Context, name string) error
	DropStaging(ctx context.Context, name string) error
}

type Authorizer interface {
	EnsureSuperadmin(ctx context.Context, actorID bson.ObjectID) error
}

type Indexer interface {
	EnsureIndexes(ctx context.Context) error
}

type Service struct {
	repository Repository
	authorizer Authorizer
	indexers   []Indexer
	logger     *slog.Logger
	restoring  sync.Mutex
}

type entry struct {
	Collection string           `json:"collection,omitempty"`
	Document   json.RawMessage  `json:"document,omitempty"`
	End        bool             `json:"end,omitempty"`
	Documents  map[string]int64 `json:"documents,omitempty"`
}

type restoreState struct {
	header        Header
	counts        map[string]int64
	pending       map[string][]any
	hasSuperadmin bool
}

func NewService(repository Repository, authorizer Authorizer, indexers []Indexer, logger *slog.Logger) *Service {
	return &Service{repository: repository, authorizer: authorizer, indexers: indexers, logger: logger}
}

func (s *Service) Summary(ctx context.Context, actorID bson.ObjectID) (Summary, error) {
	if err := s.authorizer.EnsureSuperadmin(ctx, actorID); err != nil {
		return Summary{}, fmt.Errorf("backup summary: %w", err)
	}

	names := collectionsFor(ScopeFull)
	summary := Summary{Collections: make([]CollectionSummary, 0, len(names))}
	for _, name := range names {
		total, err := s.repository.Count(ctx, name)
		if err != nil {
			return Summary{}, fmt.Errorf("backup summary: %w", err)
		}
		summary.Collections = append(summary.Collections, CollectionSummary{Name: name, Group: groupOf(name), Documents: total})
	}
	return summary, nil
}

func (s *Service) Authorize(ctx context.Context, actorID bson.ObjectID) error {
	if err := s.authorizer.EnsureSuperadmin(ctx, actorID); err != nil {
		return fmt.Errorf("authorize backup: %w", err)
	}
	return nil
}

func (s *Service) Export(ctx context.Context, actorID bson.ObjectID, scope string, target io.Writer) error {
	if err := s.authorizer.EnsureSuperadmin(ctx, actorID); err != nil {
		return fmt.Errorf("export backup: %w", err)
	}
	if scope == "" {
		scope = ScopeFull
	}
	names := collectionsFor(scope)
	header := Header{Format: Format, Version: FormatVersion, Scope: scope, CreatedAt: time.Now().UTC(), Collections: names, Documents: map[string]int64{}}
	for _, name := range names {
		total, err := s.repository.Count(ctx, name)
		if err != nil {
			return fmt.Errorf("export backup: %w", err)
		}
		header.Documents[name] = total
	}

	compressed := gzip.NewWriter(target)
	buffered := bufio.NewWriterSize(compressed, 64<<10)
	if err := writeLine(buffered, header); err != nil {
		return fmt.Errorf("export backup header: %w", err)
	}

	footer := Footer{End: true, Documents: map[string]int64{}}
	for _, name := range names {
		err := s.repository.Each(ctx, name, func(document bson.Raw) error {
			extended, err := bson.MarshalExtJSON(document, true, false)
			if err != nil {
				return fmt.Errorf("encode %s document: %w", name, err)
			}
			if err := writeLine(buffered, entry{Collection: name, Document: extended}); err != nil {
				return fmt.Errorf("write %s document: %w", name, err)
			}
			footer.Documents[name]++
			return nil
		})
		if err != nil {
			return fmt.Errorf("export backup: %w", err)
		}
	}

	if err := writeLine(buffered, footer); err != nil {
		return fmt.Errorf("export backup footer: %w", err)
	}
	if err := buffered.Flush(); err != nil {
		return fmt.Errorf("flush backup: %w", err)
	}
	if err := compressed.Close(); err != nil {
		return fmt.Errorf("close backup: %w", err)
	}

	s.logger.InfoContext(ctx, "backup exported", "actorId", actorID.Hex(), "scope", scope, "documents", footer.Documents)
	return nil
}

func (s *Service) Restore(ctx context.Context, actorID bson.ObjectID, source io.Reader) (*Result, error) {
	if err := s.authorizer.EnsureSuperadmin(ctx, actorID); err != nil {
		return nil, fmt.Errorf("restore backup: %w", err)
	}
	if !s.restoring.TryLock() {
		return nil, ErrRestoreRunning
	}
	defer s.restoring.Unlock()

	reader, err := openReader(source)
	if err != nil {
		return nil, fmt.Errorf("restore backup: %w", err)
	}
	decoder := json.NewDecoder(reader)

	state := restoreState{counts: map[string]int64{}, pending: map[string][]any{}}
	if err := decoder.Decode(&state.header); err != nil {
		return nil, fmt.Errorf("read backup header: %w: %w", ErrInvalidFile, err)
	}
	if err := validateHeader(state.header); err != nil {
		return nil, fmt.Errorf("restore backup: %w", err)
	}

	defer s.dropStaging(context.WithoutCancel(ctx), state.header.Collections)
	for _, name := range state.header.Collections {
		if err := s.repository.ResetStaging(ctx, name); err != nil {
			return nil, fmt.Errorf("restore backup: %w", err)
		}
	}

	if err := s.stageAll(ctx, decoder, &state); err != nil {
		return nil, fmt.Errorf("restore backup: %w", err)
	}

	for _, name := range state.header.Collections {
		if err := s.repository.Promote(ctx, name); err != nil {
			return nil, fmt.Errorf("restore backup: %w", err)
		}
	}
	for _, indexer := range s.indexers {
		if err := indexer.EnsureIndexes(ctx); err != nil {
			s.logger.WarnContext(ctx, "ensure indexes after restore", "error", err)
		}
	}

	s.logger.InfoContext(ctx, "backup restored", "actorId", actorID.Hex(), "scope", state.header.Scope, "createdAt", state.header.CreatedAt, "documents", state.counts)
	return &Result{
		Scope:       state.header.Scope,
		CreatedAt:   state.header.CreatedAt,
		RestoredAt:  time.Now().UTC(),
		Documents:   state.counts,
		Collections: state.header.Collections,
	}, nil
}

func (s *Service) stageAll(ctx context.Context, decoder *json.Decoder, state *restoreState) error {
	for {
		var line entry
		err := decoder.Decode(&line)
		if errors.Is(err, io.EOF) {
			return ErrTruncatedFile
		}
		if err != nil {
			return fmt.Errorf("read backup line: %w: %w", ErrInvalidFile, err)
		}
		if line.End {
			return s.finish(ctx, line, state)
		}
		if err := s.stageLine(ctx, line, state); err != nil {
			return err
		}
	}
}

func (s *Service) stageLine(ctx context.Context, line entry, state *restoreState) error {
	if !slices.Contains(state.header.Collections, line.Collection) {
		return fmt.Errorf("collection %q outside the header: %w", line.Collection, ErrInvalidFile)
	}

	var document bson.Raw
	if err := bson.UnmarshalExtJSON(line.Document, true, &document); err != nil {
		return fmt.Errorf("decode %s document: %w: %w", line.Collection, ErrInvalidFile, err)
	}
	if line.Collection == "users" && isSuperadmin(document) {
		state.hasSuperadmin = true
	}

	state.counts[line.Collection]++
	state.pending[line.Collection] = append(state.pending[line.Collection], document)
	if len(state.pending[line.Collection]) < insertBatchSize {
		return nil
	}
	return s.flush(ctx, line.Collection, state)
}

func (s *Service) finish(ctx context.Context, footer entry, state *restoreState) error {
	for _, name := range state.header.Collections {
		if footer.Documents[name] != state.counts[name] {
			return fmt.Errorf("collection %s has %d of %d documents: %w", name, state.counts[name], footer.Documents[name], ErrTruncatedFile)
		}
	}
	if !state.hasSuperadmin {
		return ErrMissingSuperadmin
	}
	for _, name := range slices.Sorted(maps.Keys(state.pending)) {
		if err := s.flush(ctx, name, state); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) flush(ctx context.Context, name string, state *restoreState) error {
	documents := state.pending[name]
	if len(documents) == 0 {
		return nil
	}
	if err := s.repository.Stage(ctx, name, documents); err != nil {
		return err
	}
	state.pending[name] = nil
	return nil
}

func (s *Service) dropStaging(ctx context.Context, names []string) {
	for _, name := range names {
		if err := s.repository.DropStaging(ctx, name); err != nil {
			s.logger.WarnContext(ctx, "drop restore staging", "collection", name, "error", err)
		}
	}
}

func validateHeader(header Header) error {
	if header.Format != Format {
		return ErrInvalidFile
	}
	if header.Version != FormatVersion {
		return ErrUnsupportedFormat
	}
	if !slices.Contains(header.Collections, "users") {
		return ErrMissingSuperadmin
	}
	seen := map[string]bool{}
	for _, name := range header.Collections {
		if !isKnownCollection(name) || seen[name] {
			return fmt.Errorf("collection %q: %w", name, ErrInvalidFile)
		}
		seen[name] = true
	}
	return nil
}

func isSuperadmin(document bson.Raw) bool {
	role, ok := document.Lookup("role").StringValueOK()
	return ok && role == "superadmin"
}

func openReader(source io.Reader) (io.Reader, error) {
	buffered := bufio.NewReaderSize(source, 64<<10)
	magic, err := buffered.Peek(2)
	if err != nil {
		return nil, fmt.Errorf("peek backup: %w: %w", ErrInvalidFile, err)
	}
	if magic[0] != 0x1f || magic[1] != 0x8b {
		return buffered, nil
	}
	decompressed, err := gzip.NewReader(buffered)
	if err != nil {
		return nil, fmt.Errorf("open gzip backup: %w: %w", ErrInvalidFile, err)
	}
	return decompressed, nil
}

func writeLine(target io.Writer, payload any) error {
	line, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal backup line: %w", err)
	}
	if _, err := target.Write(append(line, '\n')); err != nil {
		return fmt.Errorf("write backup line: %w", err)
	}
	return nil
}
