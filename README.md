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

## 🐳 Guia de Deploy no Dokploy (via GitHub)

Este projeto está pronto para ser implantado no **Dokploy** diretamente a partir do seu repositório no GitHub, sem a necessidade de publicar previamente imagens no Docker Hub.

### Passo 1: Criar a aplicação no Dokploy
1. Acesse o seu painel do **Dokploy**.
2. Vá em **Projects** e selecione (ou crie) o seu projeto.
3. Clique em **Create Service** e selecione a opção **Compose**.

### Passo 2: Conectar o Repositório GitHub
1. Na aba **Source**, selecione o provedor **GitHub**.
2. Conecte sua conta do GitHub caso ainda não esteja conectada.
3. Selecione o repositório `pocketrun` e a branch desejada (ex: `main` ou `master`).

### Passo 3: Configurar o Docker Compose
1. No campo **Compose Path**, informe:
   ```text
   ./docker-compose.yml
   ```
2. O Dokploy utilizará este arquivo para ler as instruções de `build` a partir da pasta `./api`.

### Passo 4: Configurar Variáveis de Ambiente (Opcional)
Na aba **Environment** do Dokploy, defina as variáveis necessárias para a API:
```env
PORT=8080
ENV=production
CORS_ALLOWED_ORIGINS=*
```

### Passo 5: Implantar (Deploy)
1. Clique no botão **Deploy**.
2. O Dokploy fará o clone do repositório, executará o build multi-stage do Docker e iniciará o container.
3. Na aba **Domains**, adicione o seu domínio ou subdomínio apontando para a porta `8080`.

### Passo 6: Verificar a Saúde da Aplicação
Após o término do deploy, acesse o endpoint de validação:
```http
GET https://seu-dominio.com/ping
```
Resposta esperada:
```json
{"status":"ok"}
```
