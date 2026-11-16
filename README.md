# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go, a UI frontend em React/Vite, esteira CI/CD via GitHub Actions e configurações para deploy.

---

## 🧩 Serviços

A mesma imagem da API roda em dois modos, escolhidos pela variável `API_MODE`:

| Serviço | `API_MODE` | Rotas | Autenticação |
| :--- | :--- | :--- | :--- |
| `api` | `public` | `/kv/*`, `/validate/*`, `/ping` | Token da aplicação (`pk_live_...`) |
| `admin` | `admin` | `/setup/*`, `/auth/*`, `/apps/*`, `/ping` | JWT do gestor |
| `ui` | — | Painel web (nginx) | — |

Todo container escuta na porta `80`. No desenvolvimento local, `API_MODE=all` sobe os dois servidores no mesmo processo, em `PORT` (pública) e `ADMIN_PORT` (admin).

---

## 🐳 Imagens Docker Hub

As imagens são compiladas e publicadas no **Docker Hub** pelo GitHub Actions a cada push na `master` cuja mensagem contém uma versão (`X.Y.Z`), como o commit `chore: bump version to X` gerado na publicação:

- **API:** `darknx/pocketrun-api:latest`
- **UI:** `darknx/pocketrun-ui:latest`

---

## 📁 Estrutura do Repositório

```text
.
├── .github/workflows/    # CI/CD - build e push para o Docker Hub
├── api/                  # API Go
│   ├── cmd/api/          # Ponto de entrada (main.go)
│   ├── internal/         # Domínios, handlers, repositórios, middlewares, config e MongoDB
│   ├── Dockerfile        # Build multi-stage com runner distroless
│   └── .dockerignore
├── ui/                   # Frontend React + Vite
│   ├── src/
│   ├── Dockerfile        # Build multi-stage com runner nginx
│   ├── nginx.conf        # SPA fallback, gzip, cache e headers de segurança
│   └── .dockerignore
├── .env.example          # Variáveis de todos os apps e do compose
├── docker-compose.yml    # Serviços api, admin e ui
└── package.json          # Scripts de orquestração
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Go 1.27+ e Node.js 22+
- Docker e Docker Compose (para rodar via containers)

### Configuração

```bash
cp .env.example .env
```

Um único `.env` na raiz é lido pelo docker-compose, pela API e pelo Vite.

### Rodando diretamente

```bash
npm install
npm --prefix ui install
npm run dev
```

- UI: `http://localhost:3000`
- API pública: `http://localhost:5000/ping`
- API admin: `http://localhost:5001/ping`

Use `npm run dev:api` ou `npm run dev:web` para subir um app só, e `npm run build` para compilar os dois.

### Rodando com Docker Compose

```bash
npm run up
```

As portas publicadas vêm de `PORT`, `ADMIN_PORT` e `FRONTEND_PORT`.

---

## 🍃 MongoDB

A conexão é definida por `MONGODB_URI` e `MONGODB_NAME`. Em produção, use um cluster externo (ex: MongoDB Atlas):

- **`MONGODB_URI`:** `mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/?retryWrites=true&w=majority`
- **`MONGODB_NAME`:** `pocketrun`

---

## 🐳 Deploy no Dokploy

### Passo 1: Compose

Crie uma aplicação Compose usando as imagens do Docker Hub:

```yaml
services:
  api:
    image: darknx/pocketrun-api:latest
    restart: unless-stopped
    expose:
      - "80"
    environment:
      - PORT=80
      - API_MODE=public
      - APP_ENV=production
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_NAME=${MONGODB_NAME}
      - JWT_SECRET=${JWT_SECRET}
    dns:
      - 8.8.8.8
      - 1.1.1.1
    networks:
      - app-network

  admin:
    image: darknx/pocketrun-api:latest
    restart: unless-stopped
    expose:
      - "80"
    environment:
      - ADMIN_PORT=80
      - API_MODE=admin
      - APP_ENV=production
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - ADMIN_CORS_ALLOWED_ORIGINS=${ADMIN_CORS_ALLOWED_ORIGINS}
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_NAME=${MONGODB_NAME}
      - JWT_SECRET=${JWT_SECRET}
    dns:
      - 8.8.8.8
      - 1.1.1.1
    networks:
      - app-network

  ui:
    image: darknx/pocketrun-ui:latest
    restart: unless-stopped
    expose:
      - "80"
    depends_on:
      - api
      - admin
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

> A imagem da UI publicada pelo CI é compilada sem `VITE_API_URL` e `VITE_PUBLIC_API_URL` e usa os valores padrão do código. Para apontar para outros domínios, gere a imagem com `--build-arg VITE_API_URL=...` (API admin) e `--build-arg VITE_PUBLIC_API_URL=...` (API pública, usada nos exemplos de código).

### Passo 2: Variáveis (aba Environment)

```env
CORS_ALLOWED_ORIGINS=*
ADMIN_CORS_ALLOWED_ORIGINS=*
MONGODB_URI=mongodb+srv://meu_usuario:minha_senha@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
JWT_SECRET=gere_uma_chave_secreta_forte_aqui
```

### Passo 3: Domínios (aba Domains)

Todos os serviços usam **Container Port `80`** e HTTPS ativado:

| Serviço | Host |
| :--- | :--- |
| `ui` | `pocketrun.odutra.com` |
| `api` | `api.pocketrun.odutra.com` |
| `admin` | `admin.pocketrun.odutra.com` |

Clique em **Save** e faça o **Deploy**.
