# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go, a UI frontend em React/Vite e as configurações para deploy contínuo.

---

## 📁 Estrutura do Repositório

```text
.
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
A UI estará acessível em `http://localhost:3000` e a API em `http://localhost:8080/ping`.

### Rodando via Docker Compose localmente
```bash
docker compose up -d --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8080/ping`

---

## 🐳 Guia de Deploy no Dokploy

O deploy no **Dokploy** pode ser feito de duas formas: usando a opção **Raw** (copiando o YAML direto no painel) ou conectando o **GitHub**.

---

### Opção 1: Deploy via Provider `Raw` (Recomendado / Rápido)

Nesta opção, você cola o conteúdo do Docker Compose diretamente no editor do Dokploy. O Docker Compose irá clonar o repositório do GitHub e fazer o build das pastas `/api` e `/ui` automaticamente.

#### Passo a Passo:
1. No Dokploy, vá em **Projects** e crie um novo **Service** do tipo **Compose**.
2. Na aba **Source / Provider**, selecione a opção **`Raw`**.
3. No campo de texto **Compose File**, cole o trecho de código abaixo:

```yaml
version: '3.8'

services:
  api:
    build:
      context: https://github.com/odutradev/pocketrun.git#master:api
      dockerfile: Dockerfile
    container_name: pocketrun-api
    restart: always
    ports:
      - "8080:8080"
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
    build:
      context: https://github.com/odutradev/pocketrun.git#master:ui
      dockerfile: Dockerfile
    container_name: pocketrun-ui
    restart: always
    ports:
      - "3000:80"
    depends_on:
      api:
        condition: service_healthy
```

4. Clique em **Save** e em seguida **Deploy**.
5. Na aba **Domains**, mapeie os domínios desejados apontando para as portas correspondentes (`8080` para API e `3000` para UI).

---

### Opção 2: Deploy via Provider `GitHub`

Se você preferir integrar sua conta do GitHub para deploys automáticos em cada push:

1. No Dokploy, crie um **Service** do tipo **Compose**.
2. Na aba **Source / Provider**, selecione **GitHub**.
3. Selecione o repositório `odutradev/pocketrun` e a branch `master`.
4. No campo **Compose Path**, informe:
   ```text
   ./docker-compose.yml
   ```
5. Clique em **Deploy**.

---

## 🔍 Validação da Aplicação

Após o deploy ser concluído, valide o status da aplicação:

1. Interface Web: `http://localhost:3000` (ou seu domínio configurado)
2. Status da API: `http://localhost:8080/ping`

Resposta esperada no ping da API:
```json
{"status":"ok"}
```
