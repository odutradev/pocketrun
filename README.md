# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go, a UI frontend em React/Vite, esteira CI/CD via GitHub Actions e configurações para deploy.

---

## 🐳 Imagens Docker Hub

As imagens Docker deste projeto são automaticamente compiladas e publicadas no **Docker Hub** através do GitHub Actions a cada push na branch `master`:

- **API Backend:** `darknx/pocketrun-api:latest`
- **UI Frontend:** `darknx/pocketrun-ui:latest`

---

## 🍃 Opções de Banco de Dados MongoDB

A API do PocketRun oferece suporte nativo a duas formas de conexão com o MongoDB, alternáveis pela variável de ambiente `MONGODB_URI`:

### ☁️ MongoDB Externo / Nuvem (ex: MongoDB Atlas)
Configuração recomendada para produção no Dokploy:
- **`MONGODB_URI`:** `mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/?retryWrites=true&w=majority`
- **`MONGODB_NAME`:** `pocketrun`

---

## 📁 Estrutura do Repositório

```text
.
├── .github/workflows/   # CI/CD - Build e push automático para o Docker Hub
├── api/                  # Código-fonte da API Go (pocketrun-api)
│   ├── cmd/server/       # Ponto de entrada da aplicação (main.go)
│   ├── internal/         # Regras de negócio, handlers, middlewares, configs e DB (MongoDB)
│   ├── Dockerfile        # Build multi-stage para gerar a imagem minimalista da API
│   └── .dockerignore     # Arquivos ignorados durante a cópia para o container
├── ui/                   # Aplicação Frontend React + Vite (pocketrun-ui)
│   ├── src/              # Código-fonte da interface (subcomponentes, estilos, tipos)
│   ├── Dockerfile        # Build multi-stage com Nginx para o frontend
│   ├── nginx.conf        # Configuração do Nginx e proxy de API
│   └── .dockerignore     # Arquivos ignorados durante a cópia para o container
├── docker-compose.yml    # Orquestração dos serviços (API + UI) para deploy no Dokploy
└── README.md             # Instruções de uso e implantação
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Go 1.24+ e Node.js 22+ (se rodar diretamente sem Docker)
- Docker & Docker Compose (se rodar via containers)

### Rodando diretamente (Sem Docker)

**Terminal 1 — API Backend:**
```bash
cd api
go run ./cmd/server
```

**Terminal 2 — UI Frontend:**
```bash
cd ui
npm run dev
```
A UI estará acessível em `http://localhost:5173` e a API em `http://localhost:8080/ping`.

---

## 🐳 Guia de Deploy no Dokploy (Hostinger DNS / Sem Cloudflare)

---

### Passo 1: Configuração do Compose no Dokploy

No Dokploy, cole o arquivo `docker-compose.yml` sem o container local de banco de dados:

```yaml
services:
  api:
    image: darknx/pocketrun-api:latest
    container_name: pocketrun-api
    restart: always
    expose:
      - "8080"
    environment:
      - PORT=${PORT:-8080}
      - ENV=${ENV:-production}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-*}
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_NAME=${MONGODB_NAME:-pocketrun}
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/ping || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 5s

  ui:
    image: darknx/pocketrun-ui:latest
    container_name: pocketrun-ui
    restart: always
    expose:
      - "80"
    depends_on:
      api:
        condition: service_healthy
```

---

### Passo 2: Configuração das Variáveis na Aba Environment no Dokploy

Na aba **Environment** do Dokploy, informe sua URI externa do MongoDB (ex: MongoDB Atlas):

```env
PORT=8080
ENV=production
CORS_ALLOWED_ORIGINS=*
MONGODB_URI=mongodb+srv://meu_usuario:minha_senha@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
```

---

### Passo 3: Configuração de Domínio no Dokploy (Aba Domains)

Na aba **Domains** do serviço Compose no Dokploy:

1. **Frontend (`ui`):**
   * **Service Name:** `ui`
   * **Host:** `pocketrun.odutra.com`
   * **Container Port:** `80`
   * **HTTPS:** Ativado.

2. Clique em **Save** e faça o **Deploy**.
