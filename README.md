# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go, a UI frontend em React/Vite, esteira CI/CD via GitHub Actions e configurações para deploy.

---

## 🐳 Imagens Docker Hub

As imagens Docker deste projeto são automaticamente compiladas e publicadas no **Docker Hub** através do GitHub Actions a cada push na branch `master`:

- **API Backend:** `darknx/pocketrun-api:latest`
- **UI Frontend:** `darknx/pocketrun-ui:latest`

---

## 📁 Estrutura do Repositório

```text
.
├── .github/workflows/   # CI/CD - Build e push automático para o Docker Hub
├── api/                  # Código-fonte da API Go (pocketrun-api)
│   ├── cmd/server/       # Ponto de entrada da aplicação (main.go)
│   ├── internal/         # Regras de negócio, handlers, middlewares e configs
│   ├── Dockerfile        # Build multi-stage para gerar a imagem minimalista da API
│   └── .dockerignore     # Arquivos ignorados durante a cópia para o container
├── ui/                   # Aplicação Frontend React + Vite (pocketrun-ui)
│   ├── src/              # Código-fonte da interface (subcomponentes, estilos, tipos)
│   ├── Dockerfile        # Build multi-stage com Nginx para o frontend
│   ├── nginx.conf        # Configuração do Nginx e proxy de API
│   └── .dockerignore     # Arquivos ignorados durante a cópia para o container
├── docker-compose.yml    # Orquestração dos serviços (API + UI) para deploy local ou Dokploy
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
A UI estará acessível em `http://localhost:3000` e a API em `http://localhost:8080/ping`.

### Rodando via Docker Compose localmente
```bash
docker compose up -d --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8080/ping`

---

## 🐳 Guia de Deploy no Dokploy (via Docker Hub)

Com as imagens publicadas no Docker Hub, o deploy no **Dokploy** fica muito mais rápido, pois o servidor não precisa compilar o código-fonte, apenas baixar as imagens prontas.

---

### Deploy via Provider `Raw` (Recomendado / Mais Rápido)

#### Passo a Passo:
1. No Dokploy, vá em **Projects** e crie um novo **Service** do tipo **Compose**.
2. Na aba **Source / Provider**, selecione a opção **`Raw`**.
3. No campo de texto **Compose File**, cole o trecho de código abaixo:

```yaml
version: '3.8'

services:
  api:
    image: darknx/pocketrun-api:latest
    container_name: pocketrun-api
    restart: always
    expose:
      - "8080"
    environment:
      - PORT=8080
      - ENV=production
      - CORS_ALLOWED_ORIGINS=*
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

4. Clique em **Save** e em seguida **Deploy**.
5. Na aba **Domains**, adicione os domínios desejados informando a porta interna de cada container (`80` para a UI e `8080` para a API).

---

## 🔍 Validação da Aplicação

Após o deploy ser concluído, valide o status da aplicação:

1. Interface Web: `http://localhost:3000` (ou seu domínio configurado)
2. Status da API: `http://localhost:8080/ping`

Resposta esperada no ping da API:
```json
{"status":"ok"}
```

