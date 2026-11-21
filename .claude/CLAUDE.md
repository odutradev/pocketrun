# Fullstack monorepo guide

This repository holds the API in `api/` and the frontend in `ui/`. This guide defines the root rules: structure, scripts, environment variables, Docker, docker-compose, nginx, commits and publishing. Following it is **mandatory**.

**Directive:** before changing an app, read its guide: `api/CLAUDE.md` for the API and `ui/CLAUDE.md` for the frontend. Each app's code, architecture and naming rules live there.

**Product:** `.claude/PRODUCT.md` describes what PocketRun is, its concepts, modules and roadmap. Read it before designing a feature or writing user-facing text.

**Docs index:** `llms.txt` at the root is the summary of the whole project in the [llms.txt](https://llmstxt.org) format, modeled on [abacatepay.com/llms.txt](https://abacatepay.com/llms.txt): one line per route, guide and key file, each linked to where it lives. Read it first when creating something, to find the route, file or rule involved. When a route, guide or key file is added, renamed or removed, update `llms.txt` in the same work. The panel's **Documentação** page (`/docs`) shows a copy of it from `ui/src/assets/data/docs/llms.txt`: run `npm run sync:llms` after editing (`npm run build` does it too), because the `ui` Docker build cannot read files outside `ui/`.

**Roadmap:** `.docs/ROADMAP.md` lists planned work as numbered items. Only the user decides what runs: never start, continue or suggest-and-do a roadmap item unless the user asks for it by number in their message. Doing one item never authorizes another, dependencies included. When an item is done, mark it `✅ Feito` in that file in the same work.

**Reply language:** always talk to the user in Brazilian Portuguese (pt-BR): answers, explanations, questions, plans and summaries. This guide is written in English only because AI models follow English instructions more reliably. Code, identifiers and commit messages follow the rules below.

## 1. Repository structure

```text
.
├── api/
│   ├── .dockerignore
│   ├── .env.example  # local dev
│   ├── CLAUDE.md  # API guide
│   ├── Dockerfile
│   ├── go.mod
│   └── src  # API code
├── ui/
│   ├── .dockerignore
│   ├── .env.example  # local dev
│   ├── CLAUDE.md  # frontend guide
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src  # frontend code
├── .env.example
├── docker-compose.yml
├── docker-compose.override.yml
└── package.json
```

- Each app is independent: the Go API has its own `go.mod` and the frontend its own `package.json`. Dependencies are installed in the app's folder (`go get` in `api/`, `npm install` in `ui/`).
- The root `package.json` only orchestrates the apps. It has no code and no runtime dependencies.
- No import crosses apps. The frontend talks to the API over HTTP only, through its actions layer.
- When an API contract changes, the response types are mirrored in the frontend in the same work.

## 2. Scripts and local development

- **Runner:** Scripts com --prefix. O package.json da raiz chama cada app com npm --prefix e sobe tudo junto com concurrently.
- `npm run dev` at the root starts everything. Use `dev:api` or `dev:web` to start a single app.
- `npm run build` builds both apps. Run it before calling a task done.

```json
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "dev": "concurrently -n \"api,web\" \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "cd api && go run ./cmd/api",
    "dev:web": "npm --prefix ui run dev",
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd api && go build -o bin/api ./cmd/api",
    "build:web": "npm --prefix ui run build",
    "lint": "npm --prefix ui run lint",
    "up": "docker compose up -d --build"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

## 3. Environment variables

- **Location:** one `.env` per context, each with its `.env.example`:
  - Root `.env`: read by docker-compose (and by Dokploy, from its Environment tab).
  - `api/.env`: local development of the API. The API reads `api/.env` first, then the root `.env`; the first value found wins.
  - `ui/.env`: local development of the frontend. Vite reads only `ui/.env`; Docker builds receive the `VITE_` variables as `ARG`.
- Never commit `.env`. Every new variable goes into the matching `.env.example` (root and app) with a safe example value.
- Variables read by the frontend use the `VITE_` prefix and are public: never put secrets in them.
- `VITE_API_URL` points to the API's public URL in each environment.

## 4. Docker and deploy

### Docker

- Each app has a multi-stage `Dockerfile` in its own folder: a `builder` stage (`npm ci` and build) and a `runner` stage with only what is needed to run.
- Base image for Node stages: `node:22-alpine`. Do not change the version unless asked.
- Go API: the builder uses `golang:1.23-alpine`, downloads modules before copying the code (layer cache) and builds a static binary with `CGO_ENABLED=0 go build -trimpath -ldflags="-s -w"`. The runner is `gcr.io/distroless/static-debian12`, with only the binary, running as `nonroot`.

- Frontend: Vite variables come in as `ARG` and become `ENV` before the build (`VITE_API_URL`), because Vite inlines them into the build. Never read secrets in the frontend.
- The frontend runner is `nginx:alpine` serving `dist` with the app's `nginx.conf`.
- Every container listens on port 80. The external port is set in compose or in the deploy.
- Every folder with a `Dockerfile` has a `.dockerignore` that ignores `node_modules`, `dist`, `.git`, `.env`, `.env.*` and docs. Never copy `.env` into the image: configuration comes from environment variables.

### docker-compose

- One `docker-compose.yml` at the root, with one service per app plus the support services. It is the file Dokploy deploys (`-f docker-compose.yml`).

- Every service uses `restart: unless-stopped` and the same `app-network` bridge network.
- Inside the network, apps reach services by name (`redis://redis:6379`), never `localhost`.
- `docker-compose.yml` never publishes host ports: services use `expose: ["80"]` and Traefik routes by domain. Publishing a host port in production collides with other services on the server (`port is already allocated`).
- Host ports for local runs live only in `docker-compose.override.yml`, which `docker compose up` loads automatically and Dokploy ignores. They use a variable with a default: `"${PORT:-5000}:80"`. Secrets have no default.
- `depends_on` sets the startup order: support services before the API and the API before the frontend.
- Every new variable goes into `.env.example` and into the compose service in the same commit.

### Nginx

- nginx serves the frontend static build with SPA fallback: `try_files $uri $uri/ /index.html`.
- The API does not go through nginx: it is exposed on its own port or domain, and the frontend calls `VITE_API_URL`.
- `gzip` on for text, JS, CSS, JSON and SVG.
- Security headers on every response: `X-Frame-Options`, `X-Content-Type-Options` and `Referrer-Policy`.
- Cache: `/assets/` for 1 year and `immutable`; `index.html` never cached so updates are instant.
- The `/healthz` endpoint returns 200 for the healthcheck.

### Reference files

#### `api/Dockerfile`

```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12 AS runner
WORKDIR /app
ENV PORT=80
COPY --from=builder /out/api /app/api
EXPOSE 80
USER nonroot:nonroot
ENTRYPOINT ["/app/api"]
```

#### `api/.dockerignore`

```text
bin
coverage.out
.git
.gitignore
.env
.env.*
*.local
CLAUDE.md
README.md
```

#### `ui/Dockerfile`

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `ui/.dockerignore`

```text
node_modules
dist
.git
.gitignore
.env
.env.*
*.local
npm-debug.log*
CLAUDE.md
README.md
```

#### `docker-compose.yml`

```yaml
services:
  api:
    build:
      context: ./api
    restart: unless-stopped
    env_file:
      - .env
    expose:
      - "80"
    environment:
      - PORT=80
      - APP_ENV=production
    networks:
      - app-network
  ui:
    build:
      context: ./ui
      args:
        - VITE_API_URL=${VITE_API_URL:-http://localhost:5000}
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

#### `docker-compose.override.yml`

```yaml
services:
  api:
    ports:
      - "${PORT:-5000}:80"
  ui:
    ports:
      - "${FRONTEND_PORT:-3000}:80"
```

#### `ui/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        expires 0;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /healthz {
        access_log off;
        return 200 "healthy\n";
    }
}
```

## 5. Commits and Git

- **Format:** Conventional Commits. `<type>: <short description>`, with type one of `feat`, `fix`, `docs`, `style`, `refactor`, `test` and `chore`. Imperative verb, no trailing period.
- **Language:** Commit messages in English.
- **Granularity:** Step by step. One commit right after each finished step of the work, in order.
- **Scope:** No scope. Only the type before the colon.
- **Message:** Subject only. One short line, up to 72 characters.
- **When to commit:** When the task is done. Commit without waiting to be asked, as soon as each part is ready and typecheck, lint and tests pass.
- **AI co-authorship:** No AI co-authorship. Never add `Co-Authored-By` or any mention of AI to messages.
- **When finished:** after the last commit, list every commit made in the task, one per line, as `{hash} {message}`, using the short hash.
- Never commit environment files (`.env`), secrets, builds or `node_modules`.
- **Branches:** type/description. Change type prefix and a kebab-case description.

Example history for a feature:

```text
1a2b3c4  feat: add user profile schemas and repository
240eb3d  feat: add update profile action
2df22b6  feat: add profile types and actions
37d5a2f  feat: add profile page
41b91a8  chore: add profile env vars to compose
```

```text
feat/user-profile
fix/login-redirect
docs/readme
```

## 6. Publishing

This project publishes with [project-publisher](https://www.npmjs.com/package/project-publisher). npx. Runs without installing anything in the project.

| Flag | Step | What it does |
| :--- | :--- | :--- |
| `--bump-package` | Bump version | Increments the package.json patch (1.0.9 becomes 1.1.0). |
| `--push` | Push to git | Runs git add, commit "chore: bump version to X" and pushes the branch. |

Steps run in flag order. Default command:

```bash
npx project-publisher --bump-package --push
```

**Before publishing:**

- Commit all of the task's work following the commit rules. The `--push` flag runs `git add .` and creates the commit `chore: bump version to X`: any pending change would end up in that commit.
- The working tree must be clean, except for what publishing itself changes.
- The push goes to the `master` branch.
- The bump only raises the patch. To change minor or major, edit the version in `package.json` by hand before running.

### Required question at the end of every task

When you finish **every** task that changed files, after committing as described in the commits section and with typecheck, lint and build passing, your last action is to ask whether to publish. Use the interactive question tool (`AskUserQuestion`), which shows a box with buttons:

- **Question:** "Do you want to bump the version and publish?"
- **Header:** "Publish"
- **Options:**
  - **Yes, publish**: bump version, push to git → runs `npx project-publisher --bump-package --push`
  - **Not now**: Nothing is published.

If the tool is not available, ask the same question in text as the last line of your reply, listing the options.

- Only run the command for the chosen option. On "Not now", run nothing and do not ask again in the same task.
- Do not ask when the task changed no files (questions, reads or explanations only).
- Do not ask if the build, tests or typecheck failed: fix them first or say that publishing is blocked.

## 7. App guides

- **API (`api/`):** `api/CLAUDE.md`
- **Frontend (`ui/`):** `ui/CLAUDE.md`

Claude Code loads the folder's CLAUDE.md when working in it. Read the app's guide before creating or editing code in it.

## 8. Checklist before delivering

- [ ] API code stayed in `api/` and frontend code in `ui/`, following each app's guide.
- [ ] No import crosses apps. The frontend talks to the API over HTTP only.
- [ ] Changed API response types were mirrored in the frontend.
- [ ] New environment variables were added to `.env.example` and `docker-compose.yml`.
- [ ] New dependencies went into the API's `go.mod` or the frontend's `package.json`, never at the root.
- [ ] Publish question asked as the last action, if the task changed files.
