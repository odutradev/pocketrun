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

## 2. Architecture: Pacotes por domínio (cmd + internal)

O layout mais comum em Go: `cmd/api` sobe o servidor e cada domínio é um pacote em `internal` com handler, service, repository e o tipo do domínio.

**Rules:**

- `cmd/api/main.go` só lê a configuração, monta as dependências e sobe o servidor. Nenhuma regra de negócio ali.
- Cada domínio é um pacote em `internal/<dominio>` com `handler.go`, `service.go`, `repository.go` e o arquivo do tipo (`user.go`).
- O service declara a interface do repositório que consome. O pacote exporta só o que outros pacotes usam.
- Código compartilhado de infraestrutura fica em `internal/platform` (banco, HTTP, logs). Nada de pacotes `utils` ou `common`.
- A domain that grows past one subject becomes a folder of subdomains, one package per subject: `internal/page/{page, version, history, analytics, public}` and `internal/link/{link, history, analytics, public}`. Each subdomain has its own handler, service, repository and type file, and registers its own routes.
- Dependencies between subdomains point one way: the core package (`page/page`, `link/link`) uses `version`, `history` and `analytics` through interfaces it declares, and those packages never import the core. When they need data from the core (expiry, titles, existence), their handler or service receives a small interface the core service implements.
- `public` holds what visitors reach without login (redirects, page HTML). Admin routes stay in the other subdomains.
- Shared non-domain logic used by several domains lives in `internal/platform` (`activation` for schedules and click limits, `traffic` for visits and analytics math). The event actor lives in `user` (`user.Actor`).
- Um domínio nunca importa o repositório de outro: chama o service exportado dele.
- Repository interfaces live in the consuming service.
- Everything that is not public module API lives in `internal/`.

**Folder structure:**

```text
.
├── cmd/
│   └── api/
│       └── main.go  # monta as dependências e sobe o servidor
├── internal/
│   ├── config/
│   │   └── config.go  # variáveis de ambiente
│   ├── platform/
│   │   ├── activation/  # agenda e limite de cliques
│   │   ├── database/
│   │   │   └── mongo.go  # conexão
│   │   ├── httpx/
│   │   │   └── respond.go  # JSON e erros HTTP
│   │   └── traffic/  # visitas e contas de análise
│   ├── page/  # domínio com subdomínios
│   │   ├── page/  # página: handler, service, repository, page.go
│   │   ├── version/  # versões do HTML
│   │   ├── history/  # eventos da página
│   │   ├── analytics/  # aberturas e análise
│   │   └── public/  # entrega do HTML para o visitante
│   └── user/
│       ├── handler.go  # HTTP
│       ├── repository.go  # acesso ao banco
│       ├── service.go  # regra de negócio
│       └── user.go  # tipo do domínio e erros
└── go.mod  # module app
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
| Structural packages | in English, as in the Go ecosystem | `handler, service, repository, platform` |
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

	"app/internal/platform/httpx"
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

### `internal/user/service.go`

```go
package user

import (
	"context"
	"fmt"
)

type Repository interface {
	FindByID(ctx context.Context, id string) (*User, error)
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) GetUserByID(ctx context.Context, id string) (*User, error) {
	user, err := s.repository.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user %s: %w", id, err)
	}
	return user, nil
}
```

### `internal/user/user.go`

```go
package user

import "errors"

const MaxNameLength = 120

var ErrUserNotFound = errors.New("user not found")

type User struct {
	ID       string `json:"id" bson:"_id"`
	Name     string `json:"name" bson:"name" validate:"required,max=120"`
	IsActive bool   `json:"isActive" bson:"isActive"`
}
```

### `internal/user/repository.go`

```go
package user

import (
	"context"
	"errors"

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
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}
```

### `internal/user/handler.go`

```go
package user

import (
	"errors"
	"log/slog"
	"net/http"

	"app/internal/platform/httpx"
)

type Handler struct {
	service *Service
	logger  *slog.Logger
}

func NewHandler(service *Service, logger *slog.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /users/{id}/details", h.getUserByID)
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

## 11. Checklist before delivering

- [ ] `gofmt`, `goimports` and `go vet` pass with no changes. `golangci-lint run` with no warnings.
- [ ] Names follow Go conventions and are in English.
- [ ] Packages and files are in the right place for the architecture.
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
