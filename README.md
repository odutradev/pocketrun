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
A UI estará acessível em `http://localhost:5173` (ou porta configurada pelo Vite) e a API em `http://localhost:8080/ping`.

### Rodando via Docker Compose localmente
```bash
docker compose up -d --build
```
- Frontend UI: `http://localhost:3001`
- Backend API: `http://localhost:8080/ping`

---

## 🐳 Guia de Deploy no Dokploy (Hostinger DNS / Sem Cloudflare)

Com o `docker-compose.yml` ajustado e as imagens no Docker Hub, o deploy no **Dokploy** é direto e simples.

---

### Passo 1: Configuração do Compose no Dokploy

1. No Dokploy, vá em **Projects** e crie/abra um **Service** do tipo **Compose**.
2. Na aba **Source**, escolha **`Git`** (conectado ao repositório) ou **`Raw`**.
3. Se usar **`Raw`**, cole o conteúdo do `docker-compose.yml`:

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

4. Clique em **Save** e **Deploy**.

---

### Passo 2: Configuração de Domínios na Hostinger

No painel de DNS da **Hostinger**, adicione os registros Tipo **A** apontando para o IP da sua VPS:

* `pocketrun.odutra.com` -> `IP_DA_SUA_VPS`
* *(Opcional)* `api.pocketrun.odutra.com` -> `IP_DA_SUA_VPS`

---

### Passo 3: Configuração de Domínio no Dokploy (Aba Domains)

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
   * *Nota:* Se não desejar subdomínio para a API, você não precisa adicionar domínio para o serviço `api` no Dokploy, pois a `ui` já faz o proxy interno de `/ping` diretamente para `http://api:8080`.

3. Clique em **Save** e em seguida faça o **Deploy / Redeploy** da aplicação.

---

### 🚨 Cuidados Importantes (Evitando o `ERR_TUNNEL_CONNECTION_FAILED`)

1. **Não use `:80` na URL:**
   Acesse sempre via `https://pocketrun.odutra.com` diretamente no navegador. O ícone de atalho `↗` no painel do Dokploy pode tentar abrir com `:80` no final, gerando erro de túnel.
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
{"status":"ok"}
```


