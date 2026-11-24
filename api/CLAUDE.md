# Go backend standards guide

This guide defines this Go project's architecture, package, naming and code rules. Following it is **mandatory**.

**Directive:** before creating or refactoring any code, read this guide and follow exactly the structure and standards described here. When in doubt, follow Effective Go and the reference example at the end of this document.

## 1. Stack

| Item | Choice |
| :--- | :--- |
| Project type | Backend |
| Language | Go 1.23 (`go.mod`) |
| HTTP | net/http |
| Database | MongoDB |
| Validation | go-playground/validator |
| Logs | log/slog |
| Tests | No tests |

## 2. Architecture: domains, repositories and services (cmd + internal)

`cmd/api` only starts the app. `internal/app` wires everything. Each domain has a fixed shape: `domain.go`, `handlers/`, `utils/` and, when needed, `middlewares/`. Every database access lives in `internal/repositories`, shared logic and infrastructure in `internal/services`, and small pure helpers in `internal/utils`.

**Every domain, whatever its size, follows this layout strictly:**

```text
internal/domains/<domain>/
├── domain.go  # registers the domain routes (like index.ts)
├── handlers/
│   └── <subject>/
│       ├── handler.go  # routes and HTTP
│       ├── service.go  # business rules
│       └── types.go  # inputs, responses, errors and constants
├── utils/
│   └── <name>/
│       └── <name>.go  # functions the domain uses
└── middlewares/
    └── <name>/
        ├── middleware.go  # the middleware and its context helpers
        └── types.go  # interfaces and context keys
```

**Rules:**

- `cmd/api/main.go` only creates the logger and the signal context and calls `app.Run`. No wiring and no business rules there.
- `internal/app` builds everything: `repositories.go` creates every repository and runs `EnsureIndexes`, `services.go` creates the services and their dependencies, `routes.go` builds the `httpx.Router` and calls each domain's `Register`, and `app.go` loads the config, connects to the database and starts the server.
- **`domain.go`:** the domain root package exposes `Register(router httpx.Router, services Services, ...)`. It creates the domain's handlers and registers their routes on `router.Admin`, `router.Public` (the API domain) and `router.Links` (the `LINKS_URL` domain, the same mux as `router.Public` when `LINKS_URL` is empty). Nothing else lives at the domain root.
- **`handlers/<subject>/`:** one package per subject, always with exactly `handler.go`, `service.go` and `types.go`, even when one of them is small.
  - `handler.go`: the `Handler` struct, `NewHandler`, `Register` and the HTTP methods, plus HTTP-only helpers (request parsing, error mapping).
  - `service.go`: the `Service` struct, `NewService`, `Dependencies`, the interfaces the service consumes (repositories, other services) and the business-rule helpers.
  - `types.go`: inputs, params, responses, sentinel errors, constants, the methods of those types and the `ParseX` / `NewX` constructors of those types.
  - A subject with no HTTP routes is not a handler: its logic joins the service of the subject that owns it (kv usage lives in `handlers/document`).
- **`utils/<name>/`:** the domain's standalone functions, one package per subject, in one file named after the package (`utils/pinsecret/pinsecret.go`). Package names must not collide with common variable names (`kvquery`, `csvexport`, `linkchanges`, `sessioncookie`, `passwordhash`, `jwt`). Utils never import the domain's handlers.
- **`middlewares/<name>/`:** HTTP middleware of the domain and its context helpers (`managerauth`, `appauth`). A middleware depends on interfaces declared in its `types.go`, never on a handler package, so handlers can import it without a cycle.
- **Repositories:** every repository lives in `internal/repositories/<name>`, one package per collection or per kind of record: `repository.go` (`MongoRepository`, its constructor and `EnsureIndexes`), `model.go` (the stored structs and their methods) and `types.go` (sentinel errors, constants, enums, filters, queries and inputs) when there are any. Repositories never import `domains`. They may import `services` and other repositories' models.
- **Domains use the repository directly, never a copy of the model:** handlers and services import the repository package and use its types (`pagerepository.Page`, `pagerepository.ErrNotFound`). No aliases, no `models.go` in domains. A domain error that comes from the repository points at its sentinel (`ErrPageNotFound = pagerepository.ErrNotFound`).
- **Import aliases:** a repository package is imported with the `repository` suffix (`pagerepository`), a shared service with the `service` suffix when its name collides (`historyservice`, `analyticsservice`), and a handler package with the `handler` suffix inside `domain.go` when it has the domain's name (`pagehandler`).
- **Interfaces:** the service declares the interface of the repository it consumes (accept interfaces, return structs). A domain never uses another domain's repository: it calls that domain's exported service.
- **Shared repositories:** records with the same shape share one repository, configured per collection. `repositories/event` stores the history of links and pages and `repositories/open` stores their opens, both keyed by `targetId`.
- **Services:** `internal/services` holds logic and infrastructure that several domains use: `database`, `httpx` (server, CORS, JSON, decoding, `Router`), `logger` (the colored `slog` handler of `cmd/`), `ratelimit`, `activation`, `traffic`, `slug`, `history` and `analytics`. Services never import `domains`.
- **Utils (global):** `internal/utils` holds small pure helpers used across domains (`pointers.go`, `urls.go`, `request.go`). Domain-specific functions go to the domain's own `utils/`.
- Dependencies between subjects point one way: the core subject (`page/handlers/page`, `link/handlers/link`) uses `version`, `history`, `analytics` and `access` through interfaces it declares, and those packages never import the core.
- `public` holds what visitors reach without login (redirects, page HTML). Admin routes stay in the other subjects.
- **Data migrations:** a change to how a collection is stored ships with an idempotent migration in the repository's `EnsureIndexes`, using the `services/database` helpers. Backup restore runs those migrations again after promoting the collections.
- Everything that is not public module API lives in `internal/`.

**Folder structure:**

```text
.
├── cmd/
│   ├── api/
│   │   └── main.go  # logger, signal context, app.Run
│   └── reset/
│       └── main.go  # local database reset
├── internal/
│   ├── app/  # wiring: repositories, services, routes, server
│   ├── config/
│   ├── domains/
│   │   ├── user/
│   │   │   ├── domain.go
│   │   │   ├── handlers/{user, setup}
│   │   │   ├── middlewares/managerauth
│   │   │   └── utils/{jwt, passwordhash, sessioncookie}
│   │   ├── kv/
│   │   │   ├── domain.go
│   │   │   ├── handlers/{application, document}
│   │   │   ├── middlewares/appauth
│   │   │   └── utils/{apptoken, roles, kvquery, csvexport}
│   │   ├── link/
│   │   │   ├── domain.go
│   │   │   ├── handlers/{link, history, analytics, public}
│   │   │   └── utils/linkchanges
│   │   ├── page/
│   │   │   ├── domain.go
│   │   │   ├── handlers/{page, version, history, analytics, access, binding, public}
│   │   │   └── utils/{pagechanges, pagegate, pagerender, pinsecret, versionlabel}
│   │   ├── group/  # domain.go + handlers/group
│   │   ├── overview/  # domain.go + handlers/overview
│   │   ├── backup/  # domain.go + handlers/backup + utils/collections
│   │   └── health/  # domain.go + handlers/health
│   ├── repositories/
│   │   ├── user/
│   │   │   ├── model.go  # stored structs
│   │   │   ├── repository.go  # MongoRepository and indexes
│   │   │   └── types.go  # errors, constants, filters
│   │   ├── event/  # history of links and pages
│   │   ├── open/  # opens of links and pages
│   │   └── ...  # one folder per collection
│   ├── services/  # database, httpx, logger, ratelimit, activation, traffic, slug, history, analytics
│   └── utils/  # pure helpers shared by every domain
└── go.mod  # module pocketrun-api
```

## 3. Naming

- **Identifier language:** English. Types, functions, variables, domain packages, tables and fields are written in English.
- Visibility is the first letter: uppercase exports, lowercase stays in the package. Export only what another package uses.
- Avoid repeating the package name: `user.Service`, not `user.UserService`.

| Element | Standard | Example |
| :--- | :--- | :--- |
| Pacotes | minúsculas, uma palavra, sem `_` | `user, httpx` |
| Exportados | PascalCase | `GetUserByID` |
| Não exportados | camelCase | `findByID` |
| Siglas | sempre em maiúsculas | `userID, ServeHTTP, apiURL` |
| Construtores | prefixo New | `NewService` |
| Interfaces | papel ou verbo com -er | `Repository, Finder` |
| Erros sentinela | prefixo Err | `ErrUserNotFound` |
| Tipos de erro | sufixo Error | `NotFoundError` |
| Receivers | 1 ou 2 letras, sempre iguais | `func (s *Service)` |
| Getters | sem prefixo Get | `user.Name()` |
| Constantes | MixedCaps, não SCREAMING | `MaxNameLength` |
| Testes | Test + tipo + método | `TestServiceGetUserByID` |
| Files | minúsculas juntas | `userhandler.go` |
| Domain packages | in the identifier language | `user` |
| Structural packages | in English, as in the Go ecosystem | `domains, repositories, services, utils` |
| Domain errors | Err prefix in the identifier language | `ErrUserNotFound` |
| Tables and collections | camelCase | `users` |
| Columns and fields | camelCase | `createdAt` |
| JSON fields | camelCase | `isActive` |
| Route segments | kebab-case | `/user-profiles` |
| API error codes | snake_case | `user_not_found` |
| Environment variables | SCREAMING_SNAKE | `DATABASE_URL` |

## 4. Code style

- **Formatting:** `gofmt` and `goimports` on every file. Tab indentation. No style debate beyond what the formatter decides.
- **Lint:** `go vet` and `golangci-lint` (errcheck, staticcheck, revive, gosec) with no warnings.
- **Imports:** three groups separated by a blank line: standard library, external and module packages.
- **Signatures:** `ctx context.Context` first, `error` always the last return value.
- **Constructors:** `NewXxx` takes the dependencies and returns the concrete type. No `init()` with side effects.
- **Comments:** Zero comments. O código precisa ser autoexplicativo. Nomes e tipos contam a história.

```go
import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"

	"app/internal/services/httpx"
)
```

### Error handling

Erros sentinela com contexto. Erros sentinela (`ErrUserNotFound`) embrulhados com `fmt.Errorf("...: %w", err)` a cada camada e checados com `errors.Is`.

```go
return nil, fmt.Errorf("find user %s: %w", id, err)
```

- The HTTP edge maps domain errors to a status and code, and only logs unexpected errors.
- Error messages in lowercase, with no trailing period.

### Validation

go-playground/validator. Regras nas tags das structs, validadas por uma instância única.

```go
Name string `json:"name" validate:"required,max=120"`
```

### Logs

log/slog. Logger estruturado da biblioteca padrão, com contexto. The logger is injected through the constructor, never global.

```go
logger.ErrorContext(ctx, "get user", "error", err)
```

### Routes

Explicit action in the URL. The route says what the operation does.

```text
POST   /properties/create
PATCH  /properties/:id/update
DELETE /users/favorites/:id/remove
```

## 5. Required principles

### Early returns

Trate o erro e saia cedo. O caminho feliz fica sem indentação.

✅ Do:
```go
user, err := s.repository.FindByID(ctx, id)
if err != nil {
	return nil, err
}
return user, nil
```

❌ Don't:
```go
if err == nil {
	return user, nil
} else {
	return nil, err
}
```

### Erros com contexto

Nunca ignore um erro. Ao repassar, embrulhe com `%w` dizendo o que falhou.

✅ Do:
```go
if err != nil {
	return fmt.Errorf("save user %s: %w", id, err)
}
```

❌ Don't:
```go
_ = repository.Save(ctx, user)
```

### context.Context primeiro

Toda função que faz I/O recebe `ctx context.Context` como primeiro parâmetro e o repassa.

✅ Do:
```go
func (s *Service) GetUserByID(ctx context.Context, id string) (*User, error)
```

❌ Don't:
```go
func (s *Service) GetUserByID(id string) (*User, error)
```

### Sem panic no fluxo normal

`panic` só para erro de programação na inicialização. O resto retorna `error`.

✅ Do:
```go
if err != nil {
	return nil, fmt.Errorf("parse config: %w", err)
}
```

❌ Don't:
```go
if err != nil {
	panic(err)
}
```

### Aceite interfaces, retorne structs

Dependências entram como interfaces pequenas, definidas por quem consome. Construtores retornam o tipo concreto.

✅ Do:
```go
type Repository interface {
	FindByID(ctx context.Context, id string) (*User, error)
}

func NewService(repository Repository) *Service
```

❌ Don't:
```go
func NewService(repository *PostgresRepository) Servicer
```

### Sem estado global

Nada de variáveis globais mutáveis nem `init()` com efeitos. Dependências são injetadas pelo construtor em `main`.

✅ Do:
```go
service := user.NewService(user.NewPostgresRepository(pool))
```

❌ Don't:
```go
var DB *pgxpool.Pool

func init() { DB = connect() }
```

### Recursos sempre fechados

Logo depois de abrir, `defer` fecha: rows, bodies, arquivos e conexões.

✅ Do:
```go
rows, err := r.db.Query(ctx, query)
if err != nil {
	return nil, err
}
defer rows.Close()
```

### Logs estruturados

Logs com chave e valor, sem `fmt.Println` nem `log.Printf` no código da aplicação.

✅ Do:
```go
logger.ErrorContext(ctx, "get user", "user_id", id, "error", err)
```

❌ Don't:
```go
fmt.Println("erro ao buscar usuário", err)
```

### Testes de tabela

Casos de teste numa tabela com `t.Run` para cada um, nomeados pelo comportamento.

✅ Do:
```go
for _, tt := range tests {
	t.Run(tt.name, func(t *testing.T) {
		...
	})
}
```

## 6. Tests

This project does not require automated tests.

## 7. Commits and Git

Defined in the monorepo guide at the repository root. Follow the rules there.

## 8. Docker and deploy

Defined in the monorepo guide at the repository root. Follow the rules there.

## 9. Publishing

Defined in the monorepo guide at the repository root. Follow the rules there.

## 10. Reference example

Use these files as a template. They follow every rule above.

> Some standards were written by hand. Where the example differs from the sections above, follow the sections.

### `internal/domains/user/domain.go`

```go
package user

import (
	userhandler "app/internal/domains/user/handlers/user"
	"app/internal/services/httpx"
)

type Services struct {
	Users *userhandler.Service
}

func Register(router httpx.Router, services Services) {
	userhandler.NewHandler(services.Users, router.Logger).Register(router.Admin, router.Authenticate)
}
```

### `internal/domains/user/handlers/user/types.go`

```go
package user

import userrepository "app/internal/repositories/user"

const MaxNameLength = 120

var ErrUserNotFound = userrepository.ErrNotFound
```

### `internal/domains/user/handlers/user/service.go`

```go
package user

import (
	"context"
	"fmt"

	userrepository "app/internal/repositories/user"
)

type Repository interface {
	FindByID(ctx context.Context, id string) (*userrepository.User, error)
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) GetUserByID(ctx context.Context, id string) (*userrepository.User, error) {
	user, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user %s: %w", id, err)
	}
	return user, nil
}
```

### `internal/domains/user/handlers/user/handler.go`

```go
package user

import (
	"errors"
	"log/slog"
	"net/http"

	"app/internal/services/httpx"
)

type Handler struct {
	service *Service
	logger  *slog.Logger
}

func NewHandler(service *Service, logger *slog.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	mux.Handle("GET /users/{id}/details", authenticate(http.HandlerFunc(h.getUserByID)))
}

func (h *Handler) getUserByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	user, err := h.service.GetUserByID(ctx, r.PathValue("id"))
	if errors.Is(err, ErrUserNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "user_not_found")
		return
	}
	if err != nil {
		h.logger.ErrorContext(ctx, "get user", "error", err)
		httpx.WriteError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, user)
}
```

### `internal/repositories/user/model.go`

```go
package user

type User struct {
	ID       string `json:"id" bson:"_id"`
	Name     string `json:"name" bson:"name"`
	IsActive bool   `json:"isActive" bson:"isActive"`
}
```

### `internal/repositories/user/types.go`

```go
package user

import "errors"

var ErrNotFound = errors.New("user not found")
```

### `internal/repositories/user/repository.go`

```go
package user

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(collection *mongo.Collection) *MongoRepository {
	return &MongoRepository{collection: collection}
}

func (r *MongoRepository) FindByID(ctx context.Context, id string) (*User, error) {
	var user User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find user: %w", err)
	}
	return &user, nil
}
```

## 11. Checklist before delivering

- [ ] `gofmt`, `goimports` and `go vet` pass with no changes. `golangci-lint run` with no warnings.
- [ ] Names follow Go conventions and are in English.
- [ ] Packages and files are in the right place for the architecture: every domain has `domain.go`, `handlers/<subject>/{handler,service,types}.go`, `utils/<name>/` and `middlewares/<name>/` only.
- [ ] Every error is handled or returned, never discarded with `_`.
- [ ] Errors follow "Erros sentinela com contexto".
- [ ] Functions doing I/O take `context.Context` as the first parameter.
- [ ] All external input is validated (go-playground/validator).
- [ ] Principle "Early returns" applied.
- [ ] Principle "Erros com contexto" applied.
- [ ] Principle "context.Context primeiro" applied.
- [ ] Principle "Sem panic no fluxo normal" applied.
- [ ] Principle "Aceite interfaces, retorne structs" applied.
- [ ] Principle "Sem estado global" applied.
- [ ] Principle "Recursos sempre fechados" applied.
- [ ] Principle "Logs estruturados" applied.
- [ ] Principle "Testes de tabela" applied.
