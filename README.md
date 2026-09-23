# PocketRun

Monorepo da aplicação PocketRun contendo a API backend em Go, a UI frontend em React/Vite, esteira CI/CD via GitHub Actions e configurações para deploy.

---

## 🐳 Imagens Docker Hub

As imagens Docker deste projeto são automaticamente compiladas e publicadas no **Docker Hub** através do GitHub Actions a cada push na branch `master`:

- **API Backend:** `darknx/pocketrun-api:latest`
- **UI Frontend:** `darknx/pocketrun-ui:latest`

---

## 🍃 Opções de Banco de Dados MongoDB

A API do PocketRun oferece suporte nativo a duas formas de conexão com o MongoDB, alternáveis apenas pela variável de ambiente `MONGODB_URI`:

### 🍃 Opção 1: Container MongoDB Local (Docker Compose)
Ideal para desenvolvimento local ou quando você quer rodar o banco de dados no próprio servidor via container:
- **`MONGODB_URI` (no Docker Compose):** `mongodb://mongodb:27017`
- **`MONGODB_URI` (sem Docker / Go direto):** `mongodb://localhost:27017`
- **`MONGODB_NAME`:** `pocketrun`

---

### ☁️ Opção 2: MongoDB Externo / Nuvem (ex: MongoDB Atlas)
Ideal para produção ou quando você utiliza um cluster gerenciado na nuvem (como MongoDB Atlas, DigitalOcean, AWS DocumentDB):
- **`MONGODB_URI`:** `mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/?retryWrites=true&w=majority`
- **`MONGODB_NAME`:** `pocketrun`

> 💡 **Nota:** Ao utilizar uma URI externa, você pode remover ou comentar o serviço `mongodb` no `docker-compose.yml` para economizar recursos de RAM/CPU na VPS.

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
├── docker-compose.yml    # Orquestração dos serviços (MongoDB + API + UI) para deploy local ou Dokploy
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

### Rodando via Docker Compose localmente
```bash
docker compose up -d --build
```
- Frontend UI: `http://localhost:3001`
- Backend API: `http://localhost:8080/ping`
- MongoDB: `localhost:27017`

---

## 🐳 Guia de Deploy no Dokploy (Hostinger DNS / Sem Cloudflare)

Com o `docker-compose.yml` parametrizado, você pode escolher se deseja subir o MongoDB no próprio servidor ou conectar a uma URI externa no Dokploy.

---

### Passo 1: Configuração do Compose no Dokploy

1. No Dokploy, vá em **Projects** e crie/abra um **Service** do tipo **Compose**.
2. Na aba **Source**, escolha **`Git`** (conectado ao repositório) ou **`Raw`**.
3. Se usar **`Raw`**, cole o conteúdo do `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Container do MongoDB Local (Opcional - pode ser removido se usar MongoDB Atlas)
  mongodb:
    image: mongo:latest
    container_name: pocketrun-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=${MONGODB_NAME:-pocketrun}
    volumes:
      - mongodb_data:/data/db

  api:
    image: darknx/pocketrun-api:latest
    container_name: pocketrun-api
    restart: always
    ports:
      - "${PORT:-8080}:8080"
    expose:
      - "8080"
    environment:
      - PORT=${PORT:-8080}
      - ENV=${ENV:-production}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-*}
      - MONGODB_URI=${MONGODB_URI:-mongodb://mongodb:27017}
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
    ports:
      - "${UI_PORT:-3001}:80"
    expose:
      - "80"
    depends_on:
      api:
        condition: service_healthy

volumes:
  mongodb_data:
```

---

### Passo 2: Configuração das Variáveis na Aba Environment no Dokploy

Escolha uma das opções e cole na aba **Environment** do Dokploy:

#### 🔹 Para usar o Container MongoDB Local:
```env
PORT=8080
ENV=production
CORS_ALLOWED_ORIGINS=*
MONGODB_URI=mongodb://mongodb:27017
MONGODB_NAME=pocketrun
UI_PORT=3001
```

#### ☁️ Para usar o MongoDB Atlas / Remoto:
```env
PORT=8080
ENV=production
CORS_ALLOWED_ORIGINS=*
MONGODB_URI=mongodb+srv://meu_usuario:minha_senha@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
UI_PORT=3001
```

---

### Passo 3: Configuração de Domínios na Hostinger

No painel de DNS da **Hostinger**, adicione os registros Tipo **A** apontando para o IP da sua VPS:

* `pocketrun.odutra.com` -> `IP_DA_SUA_VPS`
* *(Opcional)* `api.pocketrun.odutra.com` -> `IP_DA_SUA_VPS`

---

### Passo 4: Configuração de Domínio no Dokploy (Aba Domains)

Na aba **Domains** do serviço Compose no Dokploy:

1. **Frontend (`ui`):**
   * **Service Name:** `ui`
   * **Host:** `pocketrun.odutra.com`
   * **Container Port:** `80`
   * **HTTPS:** Ativado (o Traefik emitirá o certificado Let's Encrypt automaticamente).

2. **Backend (`api`):**
   * Se for expor a API diretamente em um subdomínio:
     * **Service Name:** `api`
     * **Host:** `api.pocketrun.odutra.com`
     * **Container Port:** `8080`
     * **HTTPS:** Ativado.

3. Clique em **Save** e faça o **Deploy / Redeploy**.

---

### 🚨 Cuidados Importantes (Evitando o `ERR_TUNNEL_CONNECTION_FAILED`)

1. **Não use `:80` na URL:**
   Acesse sempre via `https://pocketrun.odutra.com` diretamente no navegador.
2. **Portas no Firewall da VPS:**
   Certifique-se de ter as portas `80` e `443` abertas no firewall da sua VPS:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

---

## 🔍 Validação da Aplicação

Após o deploy ser concluído, valide o status da aplicação:

1. Interface Web: `https://pocketrun.odutra.com`
2. Status da API: `http://localhost:8080/ping` (ou `https://pocketrun.odutra.com/ping`)

Resposta esperada no ping da API:
```json
{"status":"success","message":"pong"}
```
