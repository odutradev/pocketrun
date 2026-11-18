# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go, a UI frontend em React/Vite, esteira CI/CD via GitHub Actions e configurações para deploy.

---

## 🧩 Serviços

Uma API só, numa porta só, com dois grupos de rotas:

| Serviço | Rotas | Autenticação | CORS |
| :--- | :--- | :--- | :--- |
| `api` | `/kv/*`, `/validate/*`, `/ping` | Token da aplicação (`pk_live_...`) | `CORS_ALLOWED_ORIGINS` |
| `api` | `/admin/setup/*`, `/admin/auth/*`, `/admin/apps/*`, `/admin/ping` | JWT do gestor | `ADMIN_CORS_ALLOWED_ORIGINS` |
| `ui` | Painel web (nginx) | — | — |

Todo container escuta na porta `80`.

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
├── docker-compose.yml    # Serviços api e ui
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

O `.env` da raiz é lido pelo docker-compose. Para rodar os apps direto, copie também `api/.env.example` para `api/.env` e `ui/.env.example` para `ui/.env`. No `api/.env`, `HOST=127.0.0.1` mantém a API só na sua máquina, e o firewall do Windows não pede liberação a cada `npm run dev`.

### Rodando diretamente

```bash
npm install
npm --prefix ui install
npm run dev
```

- UI: `http://localhost:3000`
- API: `http://localhost:5000/ping` (rotas do painel em `http://localhost:5000/admin`)

Use `npm run dev:api` ou `npm run dev:web` para subir um app só, e `npm run build` para compilar os dois.

### Resetando o banco

```bash
npm run reset
```

Apaga todo o banco definido em `MONGODB_NAME` e recria os índices. Com `npm run reset:admin` (ou `npm run reset -- --admin`), também cria o superadmin `admin@pocketrun.local` com senha `1234`, pulando o setup. O comando se recusa a rodar com `APP_ENV=production`.

### Rodando com Docker Compose

```bash
npm run up
```

As portas publicadas vêm de `PORT` e `FRONTEND_PORT`.

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
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

> A imagem da UI publicada pelo CI é compilada sem `VITE_API_URL` e usa o valor padrão do código. Para apontar para outro domínio, gere a imagem com `--build-arg VITE_API_URL=...`.

### Passo 2: Variáveis (aba Environment)

```env
VITE_API_URL=https://api-pocketrun.odutra.com
LINKS_URL=https://link.odutra.com
CORS_ALLOWED_ORIGINS=*
ADMIN_CORS_ALLOWED_ORIGINS=https://pocketrun.odutra.com
MONGODB_URI=mongodb+srv://meu_usuario:minha_senha@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
JWT_SECRET=gere_uma_chave_secreta_forte_aqui
```

### Passo 3: Domínios (aba Domains)

Todos os serviços usam **Container Port `80`** e HTTPS ativado:

| Serviço | Host |
| :--- | :--- |
| `ui` | `pocketrun.odutra.com` |
| `api` | `api-pocketrun.odutra.com` |

Clique em **Save** e faça o **Deploy**.
