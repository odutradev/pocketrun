# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go e as configurações para deploy contínuo.

---

## 📁 Estrutura do Repositório

```text
.
├── api/                  # Código-fonte da API Go (pocketrun-api)
│   ├── cmd/server/       # Ponto de entrada da aplicação (main.go)
│   ├── internal/         # Regras de negócio, handlers, middlewares e configs
│   ├── Dockerfile        # Build multi-stage para gerar a imagem minimalista da API
│   └── .dockerignore     # Arquivos ignorados durante a cópia para o container
├── docker-compose.yml    # Orquestração do serviço para deploy no Dokploy
└── README.md             # Instruções de uso e implantação
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Go 1.24+ instalado (se rodar diretamente sem Docker)
- Docker & Docker Compose (se rodar via containers)

### Rodando via Go diretamente
```bash
cd api
go run ./cmd/server
```

### Rodando via Docker Compose localmente
```bash
docker compose up -d --build
```
A API estará acessível em `http://localhost:8080/ping`.

---

## 🐳 Guia de Deploy no Dokploy

O deploy no **Dokploy** pode ser feito de duas formas: usando a opção **Raw** (copiando o YAML direto no painel) ou conectando o **GitHub**.

---

### Opção 1: Deploy via Provider `Raw` (Recomendado / Rápido)

Nesta opção, você cola o conteúdo do Docker Compose diretamente no editor do Dokploy. O Docker Compose irá clonar o repositório do GitHub e fazer o build da pasta `/api` automaticamente.

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
```

4. Clique em **Save** e em seguida **Deploy**.
5. Na aba **Domains**, mapeie o seu domínio apontando para a porta `8080`.

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

## 🔍 Validação da API

Após o deploy ser concluído, valide o status da API chamando a rota de ping:

```http
GET https://seu-dominio.com/ping
```

Resposta esperada:
```json
{"status":"ok"}
```
