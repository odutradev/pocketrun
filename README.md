# PocketRun

Backend self-hosted para projetos pessoais. Uma única instância dá a cada projeto o seu armazenamento de dados (KV), além de micro-páginas e links curtos, tudo gerido por um só painel.

O repositório é um monorepo com a API em Go, o painel em React/Vite, CI/CD via GitHub Actions e a configuração de deploy.

---

## ✨ O que ele oferece

| Módulo | O que faz |
| :--- | :--- |
| **KV** | API REST de documentos JSON sem schema, separados por aplicação e por collection. Tem tokens `pk_live_...` com cargos e permissões por collection, origens permitidas (CORS), filtros, paginação, contagem e agregações (`count`, `sum`, `avg`, `min`, `max`, `distinct`), validade dos documentos e importação/exportação. |
| **Páginas** | Micro-páginas em HTML/CSS/JS, escritas no editor do painel e publicadas num slug do domínio dos links. Têm histórico de versões, acesso opcional com PIN, dados próprios pelo `pocketrun.kv` e análise de acessos. |
| **Links** | Slugs curtos que redirecionam (`302`), com grupos, QR code, ativação por período ou por número de cliques e análise de acessos. |
| **Painel** | Setup inicial, login com sessão em cookie `HttpOnly`, a página **Geral** com o uso de todos os serviços, usuários (gestor e superadmin), perfil, **Backup** (exportar e restaurar a instância inteira) e **Documentação**. |

### 🤖 Guia para IA (`llms.txt`)

O [`llms.txt`](llms.txt) explica como usar os serviços: cada rota do KV com o que mandar, o que volta e os erros, o `window.pocketrun` e o `pocketrun.kv` das páginas, o acesso com PIN, os links e a ativação. O painel o serve em `{painel}/llms.txt`, e a página **Documentação** mostra esse link para você colar numa IA junto com o pedido.

Depois de editar o arquivo da raiz, rode `npm run sync:llms` para copiá-lo para `ui/public/llms.txt`. O `npm run build` já faz isso.

---

## 🧩 Serviços e rotas

Uma API só, numa porta só, com dois grupos de rotas:

| Grupo | Rotas | Autenticação | CORS |
| :--- | :--- | :--- | :--- |
| Público | `/ping`, `/validate/control-access`, `/kv/*` | Token da aplicação (`controlAccess`, `X-Pocket-Token` ou `Authorization: Bearer`) | `CORS_ALLOWED_ORIGINS` e as origens de cada aplicação |
| Público | `/{slug}` (links e páginas) | Nenhuma (PIN nas páginas protegidas) | — |
| Painel | `/admin/*`: setup, auth, users, apps, links, pages, overview, backup | Sessão do gestor em cookie | `ADMIN_CORS_ALLOWED_ORIGINS` |

O `ui` é o painel web, servido pelo nginx. Todo container escuta na porta `80`.

---

## 🐳 Imagens Docker Hub

O GitHub Actions compila e publica as imagens no **Docker Hub** a cada push na `master` cuja mensagem tem uma versão (`X.Y.Z`), como o commit `chore: bump version to X` da publicação:

- **API:** `darknx/pocketrun-api:latest`
- **UI:** `darknx/pocketrun-ui:latest`

Cada imagem também recebe uma tag com o hash do commit.

---

## 📁 Estrutura do repositório

```text
.
├── .github/workflows/    # CI/CD: build e push para o Docker Hub
├── .docs/ROADMAP.md      # Itens planejados, numerados
├── api/                  # API Go
│   ├── cmd/api/          # Ponto de entrada da API
│   ├── cmd/reset/        # Comando que apaga e recria o banco local
│   ├── internal/         # Domínios (application, kv, page, link, group, slug, user, setup, overview, backup), config e plataforma
│   ├── Dockerfile        # Build multi-stage com runner distroless
│   └── .dockerignore
├── ui/                   # Painel React + Vite
│   ├── public/           # favicon e a cópia do llms.txt
│   ├── src/
│   ├── Dockerfile        # Build multi-stage com runner nginx
│   ├── nginx.conf        # SPA fallback, gzip, UTF-8, cache e headers de segurança
│   └── .dockerignore
├── llms.txt              # Guia de uso dos serviços para IA
├── .env.example          # Variáveis do compose
├── docker-compose.yml    # Serviços api e ui
└── package.json          # Scripts de orquestração
```

---

## 🚀 Como executar localmente

### Pré-requisitos

- Go 1.27+ e Node.js 22+
- MongoDB (local ou externo)
- Docker e Docker Compose, para rodar via containers

### Configuração

```bash
cp .env.example .env
cp api/.env.example api/.env
cp ui/.env.example ui/.env
```

- O `.env` da raiz é lido pelo docker-compose.
- O `api/.env` vale para a API em desenvolvimento. Ela lê o `api/.env` e depois o `.env` da raiz, e o primeiro valor encontrado vale. Com `HOST=127.0.0.1` a API fica só na sua máquina, e o firewall do Windows não pede liberação a cada `npm run dev`.
- O `ui/.env` vale para o painel em desenvolvimento. O Vite lê só esse arquivo.

### Variáveis

| Variável | Para que serve |
| :--- | :--- |
| `PORT` / `FRONTEND_PORT` | Portas publicadas no host (padrão `5000` e `3000`). |
| `VITE_API_URL` | URL pública da API, embutida no build do painel. |
| `LINKS_URL` / `VITE_LINKS_URL` | URL pública dos links e das páginas. Vazio usa a URL da API. Com valor, as páginas só abrem nesse domínio, para o HTML delas nunca rodar no domínio da API. |
| `CORS_ALLOWED_ORIGINS` | Origens das rotas públicas. |
| `ADMIN_CORS_ALLOWED_ORIGINS` | Origem exata do painel. Nunca use `*`, porque o painel entra com cookie. |
| `MONGODB_URI` / `MONGODB_NAME` | Conexão e nome do banco. |
| `JWT_SECRET` | Chave das sessões do painel. |
| `PAGE_ACCESS_SECRET` | Chave dos PINs das páginas, diferente do `JWT_SECRET`. Trocar depois invalida todos os PINs já criados. |

### Rodando direto

```bash
npm install
npm --prefix ui install
npm run dev
```

- Painel: `http://localhost:3000`. No primeiro acesso, o setup cria o superadmin.
- API: `http://localhost:5000/ping`, com as rotas do painel em `http://localhost:5000/admin`.

| Script | O que faz |
| :--- | :--- |
| `npm run dev` | Sobe a API e o painel juntos. |
| `npm run dev:api` / `npm run dev:web` | Sobe só um dos apps. |
| `npm run build` | Compila os dois apps (e sincroniza o `llms.txt`). |
| `npm run lint` | Lint do painel. |
| `npm run sync:llms` | Copia o `llms.txt` para `ui/public/`. |
| `npm run up` | Sobe tudo com Docker Compose. |
| `npm run reset` | Apaga o banco local e recria os índices. |

### Resetando o banco

```bash
npm run reset
```

Apaga todo o banco definido em `MONGODB_NAME` e recria os índices. O `npm run reset:admin` (ou `npm run reset -- --admin`) também cria o superadmin `admin@pocketrun.local` com a senha `1234`, pulando o setup. O comando se recusa a rodar com `APP_ENV=production`.

### Rodando com Docker Compose

```bash
npm run up
```

As portas publicadas vêm de `PORT` e `FRONTEND_PORT`, definidas no `docker-compose.override.yml`.

---

## 🍃 MongoDB

A conexão vem de `MONGODB_URI` e `MONGODB_NAME`. Em produção, use um cluster externo, como o MongoDB Atlas:

- **`MONGODB_URI`:** `mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/?retryWrites=true&w=majority`
- **`MONGODB_NAME`:** `pocketrun`

### Backup

Na tela **Backup** do painel (só superadmin), **Exportar** baixa a instância inteira num `.jsonl.gz`, e **Restaurar** troca as coleções pelo conteúdo do arquivo. A restauração só aplica as mudanças se o arquivo estiver inteiro e tiver um superadmin. O arquivo traz os hashes das senhas e dos tokens, então guarde-o fora do servidor. Para os PINs das páginas e os visitantes únicos continuarem valendo, a instância de destino precisa ter os mesmos `JWT_SECRET` e `PAGE_ACCESS_SECRET`.

---

## 🐳 Deploy no Dokploy

### Passo 1: Compose

Crie uma aplicação Compose com as imagens do Docker Hub:

```yaml
services:
  api:
    image: darknx/pocketrun-api:latest
    restart: unless-stopped
    expose:
      - "80"
    environment:
      - HOST=0.0.0.0
      - PORT=80
      - APP_ENV=production
      - LINKS_URL=${LINKS_URL}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - ADMIN_CORS_ALLOWED_ORIGINS=${ADMIN_CORS_ALLOWED_ORIGINS}
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_NAME=${MONGODB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - PAGE_ACCESS_SECRET=${PAGE_ACCESS_SECRET}
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

> O CI compila a imagem da UI sem `VITE_API_URL` e `VITE_LINKS_URL`, então ela usa o valor padrão do código. Para apontar para outros domínios, gere a imagem com `--build-arg VITE_API_URL=...` e `--build-arg VITE_LINKS_URL=...`, ou use o `docker-compose.yml` do repositório, que compila a partir do código.

### Passo 2: Variáveis (aba Environment)

```env
VITE_API_URL=https://api-pocketrun.odutra.com
LINKS_URL=https://link.odutra.com
CORS_ALLOWED_ORIGINS=*
ADMIN_CORS_ALLOWED_ORIGINS=https://pocketrun.odutra.com
MONGODB_URI=mongodb+srv://meu_usuario:minha_senha@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
JWT_SECRET=gere_uma_chave_secreta_forte_aqui
PAGE_ACCESS_SECRET=gere_outra_chave_longa_e_aleatoria
```

### Passo 3: Domínios (aba Domains)

Todos os serviços usam **Container Port `80`** com HTTPS ativado:

| Serviço | Host | Para quê |
| :--- | :--- | :--- |
| `ui` | `pocketrun.odutra.com` | Painel e `/llms.txt` |
| `api` | `api-pocketrun.odutra.com` | API pública e do painel |
| `api` | `link.odutra.com` | Links curtos e páginas (`LINKS_URL`) |

Clique em **Save** e faça o **Deploy**.
