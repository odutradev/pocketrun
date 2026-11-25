package app

import (
	"context"
	"log/slog"

	apikeyrepository "pocketrun-api/internal/repositories/apikey"
	applicationrepository "pocketrun-api/internal/repositories/application"
	backuprepository "pocketrun-api/internal/repositories/backup"
	eventrepository "pocketrun-api/internal/repositories/event"
	grouprepository "pocketrun-api/internal/repositories/group"
	kvdocumentrepository "pocketrun-api/internal/repositories/kvdocument"
	kvusagerepository "pocketrun-api/internal/repositories/kvusage"
	linkrepository "pocketrun-api/internal/repositories/link"
	loginattemptrepository "pocketrun-api/internal/repositories/loginattempt"
	openrepository "pocketrun-api/internal/repositories/open"
	pagerepository "pocketrun-api/internal/repositories/page"
	pageaccessrepository "pocketrun-api/internal/repositories/pageaccess"
	pageaccessattemptrepository "pocketrun-api/internal/repositories/pageaccessattempt"
	pagebindingrepository "pocketrun-api/internal/repositories/pagebinding"
	pagekvrequestrepository "pocketrun-api/internal/repositories/pagekvrequest"
	pageversionrepository "pocketrun-api/internal/repositories/pageversion"
	slugrepository "pocketrun-api/internal/repositories/slug"
	uniquevisitorrepository "pocketrun-api/internal/repositories/uniquevisitor"
	userrepository "pocketrun-api/internal/repositories/user"
	"pocketrun-api/internal/services/database"
)

type Indexer interface {
	EnsureIndexes(ctx context.Context) error
}

type repositories struct {
	users             *userrepository.MongoRepository
	apiKeys           *apikeyrepository.MongoRepository
	loginAttempts     *loginattemptrepository.MongoRepository
	applications      *applicationrepository.MongoRepository
	documents         *kvdocumentrepository.MongoRepository
	usage             *kvusagerepository.MongoRepository
	uniqueVisitors    *uniquevisitorrepository.MongoRepository
	slugs             *slugrepository.MongoRepository
	groups            *grouprepository.MongoRepository
	links             *linkrepository.MongoRepository
	linkEvents        *eventrepository.MongoRepository
	linkOpens         *openrepository.MongoRepository
	pages             *pagerepository.MongoRepository
	pageVersions      *pageversionrepository.MongoRepository
	pageEvents        *eventrepository.MongoRepository
	pageOpens         *openrepository.MongoRepository
	pageAccess        *pageaccessrepository.MongoRepository
	pageAccessAttempt *pageaccessattemptrepository.MongoRepository
	pageBindings      *pagebindingrepository.MongoRepository
	pageKVRequests    *pagekvrequestrepository.MongoRepository
	backup            *backuprepository.MongoRepository
}

func newRepositories(db *database.Mongo) repositories {
	return repositories{
		users:             userrepository.NewMongoRepository(db.Collection("users")),
		apiKeys:           apikeyrepository.NewMongoRepository(db.Collection("apiKeys")),
		loginAttempts:     loginattemptrepository.NewMongoRepository(db.Collection("loginAttempts")),
		applications:      applicationrepository.NewMongoRepository(db.Collection("applications")),
		documents:         kvdocumentrepository.NewMongoRepository(db.Collection("kvDocuments")),
		usage:             kvusagerepository.NewMongoRepository(db.Collection("kvUsage")),
		uniqueVisitors:    uniquevisitorrepository.NewMongoRepository(db.Collection("uniqueVisitors")),
		slugs:             slugrepository.NewMongoRepository(db.Collection("slugs")),
		groups:            grouprepository.NewMongoRepository(db.Collection("groups")),
		links:             linkrepository.NewMongoRepository(db.Collection("links")),
		linkEvents:        eventrepository.NewMongoRepository(db.Collection("linkEvents"), "linkId"),
		linkOpens:         openrepository.NewMongoRepository(db.Collection("linkOpens"), "linkId"),
		pages:             pagerepository.NewMongoRepository(db.Collection("pages")),
		pageVersions:      pageversionrepository.NewMongoRepository(db.Collection("pageVersions")),
		pageEvents:        eventrepository.NewMongoRepository(db.Collection("pageEvents"), "pageId"),
		pageOpens:         openrepository.NewMongoRepository(db.Collection("pageOpens"), "pageId"),
		pageAccess:        pageaccessrepository.NewMongoRepository(db.Collection("pageAccess")),
		pageAccessAttempt: pageaccessattemptrepository.NewMongoRepository(db.Collection("pageAccessAttempts")),
		pageBindings:      pagebindingrepository.NewMongoRepository(db.Collection("pageBindings")),
		pageKVRequests:    pagekvrequestrepository.NewMongoRepository(db.Collection("pageKvRequests")),
		backup:            backuprepository.NewMongoRepository(db),
	}
}

func (r repositories) indexers() []Indexer {
	return []Indexer{
		r.users, r.apiKeys, r.loginAttempts, r.applications, r.documents, r.usage, r.uniqueVisitors, r.slugs, r.groups,
		r.links, r.linkEvents, r.linkOpens,
		r.pages, r.pageVersions, r.pageEvents, r.pageOpens, r.pageAccessAttempt,
		r.pageBindings, r.pageKVRequests,
	}
}

func ensureIndexes(ctx context.Context, logger *slog.Logger, indexers []Indexer) {
	for _, target := range indexers {
		if err := target.EnsureIndexes(ctx); err != nil {
			logger.WarnContext(ctx, "ensure indexes", "error", err)
		}
	}
}
