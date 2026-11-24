<p align="center">
  <img src=".github/assets/banner.svg" alt="PocketRun" width="100%">
</p>

<p align="center">
  Backend self-hosted para projetos pessoais.<br>
  Dados, páginas e links de todos os seus projetos numa instância só.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.27-3E63DD?style=flat-square&labelColor=191919" alt="Go 1.27">
  <img src="https://img.shields.io/badge/React-Vite-FFC53D?style=flat-square&labelColor=191919" alt="React + Vite">
  <img src="https://img.shields.io/badge/MongoDB-46A758?style=flat-square&labelColor=191919" alt="MongoDB">
</p>

---

## Módulos

| | Módulo | O que faz |
| :-: | :--- | :--- |
| 🟦 | **KV** | Documentos JSON sem schema, separados por projeto e por collection. Tem tokens com cargos, filtros, agregações, validade e importação/exportação. |
| 🟨 | **Páginas** | Micro-páginas em HTML/CSS/JS publicadas num slug. Têm versões, PIN opcional, dados próprios pelo `pocketrun.kv` e análise de acessos. |
| 🟩 | **Links** | Links curtos com grupos, QR code, ativação por período ou por cliques e análise de acessos. |

O **painel** junta tudo isso: uso geral, usuários, backup da instância e documentação.

> [!TIP]
> O [`llms.txt`](llms.txt) descreve cada rota, payload e erro dos serviços. Cole o link `{painel}/llms.txt` numa IA junto com o seu pedido.

## Rodando localmente

Você precisa de Go 1.27+, Node.js 22+ e um MongoDB.

```bash
cp .env.example .env && cp api/.env.example api/.env && cp ui/.env.example ui/.env
npm install && npm --prefix ui install
npm run dev
```

Antes do `npm run dev`, preencha `JWT_SECRET` e `PAGE_ACCESS_SECRET` em `api/.env` com `openssl rand -hex 32` (uma chave diferente para cada). Nenhuma variável tem valor padrão: se faltar uma ou ela for inválida, a API e o painel não iniciam e dizem qual variável corrigir.

O painel abre em `http://localhost:3000`, e o primeiro acesso cria o superadmin. A API fica em `http://localhost:5000`.

| Script | O que faz |
| :--- | :--- |
| `npm run dev` | Sobe a API e o painel. |
| `npm run build` | Compila os dois apps e sincroniza o `llms.txt`. |
| `npm run reset` | Apaga o banco local. `reset:admin` também cria `admin@pocketrun.local` com a senha `1234`. |

## Deploy

As imagens são publicadas no Docker Hub a cada versão:

```text
odutradev/pocketrun-api:latest
odutradev/pocketrun-ui:latest
```

<details>
<summary><b>docker-compose.yml com MongoDB local</b></summary>

O banco roda no mesmo compose. Os dados ficam no volume `mongo-data` e não somem ao recriar o container. A API só sobe depois que o banco responde ao healthcheck.

```yaml
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
    networks:
      - app-network

  api:
    image: odutradev/pocketrun-api:latest
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
      - MONGODB_URI=mongodb://mongo:27017
      - MONGODB_NAME=${MONGODB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - PAGE_ACCESS_SECRET=${PAGE_ACCESS_SECRET}
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - app-network

  ui:
    image: odutradev/pocketrun-ui:latest
    restart: unless-stopped
    environment:
      - API_URL=${API_URL}
      - LINKS_URL=${LINKS_URL}
    expose:
      - "80"
    depends_on:
      - api
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

- O `mongo` não publica porta no host: só a API o alcança, pela rede `app-network`.
- Faça backup do volume `mongo-data` ou use o backup do painel.

</details>

<details>
<summary><b>docker-compose.yml com MongoDB externo</b></summary>

O banco fica fora do compose, como no MongoDB Atlas ou num servidor próprio. A `MONGODB_URI` vem do `.env`.

```yaml
services:
  api:
    image: odutradev/pocketrun-api:latest
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
    networks:
      - app-network

  ui:
    image: odutradev/pocketrun-ui:latest
    restart: unless-stopped
    environment:
      - API_URL=${API_URL}
      - LINKS_URL=${LINKS_URL}
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

- Se o container não resolver o endereço `mongodb+srv://` do Atlas, adicione `dns:` com os servidores DNS que você usa no serviço `api`. Não fixe um DNS público quando o banco estiver num nome da sua rede interna.
- Libere o IP do servidor na lista de acesso do banco externo.

</details>

<details>
<summary><b>Variáveis de ambiente</b></summary>

```env
API_URL=https://api.pocketrun.com
LINKS_URL=https://link.pocketrun.com
CORS_ALLOWED_ORIGINS=*
ADMIN_CORS_ALLOWED_ORIGINS=https://pocketrun.com
# Só no compose com MongoDB externo
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
JWT_SECRET=
PAGE_ACCESS_SECRET=
```

Todas são obrigatórias. Na partida, a API confere cada uma e não inicia se alguma estiver vazia ou inválida. O painel faz o mesmo com `API_URL` e `LINKS_URL`.


- `API_URL` é o endereço da API que o painel chama. O container do painel lê `API_URL` e `LINKS_URL` ao iniciar, então a mesma imagem serve para qualquer domínio.
- `LINKS_URL` é o domínio dos links e das páginas, para o HTML delas nunca rodar no domínio da API. Por isso `api.pocketrun.com/{slug}` responde `404`, e a raiz `/` dos dois domínios mostra a tela de não encontrado.
- `ADMIN_CORS_ALLOWED_ORIGINS` é a origem exata do painel. Nunca use `*`, porque o painel entra com cookie.
- `JWT_SECRET` e `PAGE_ACCESS_SECRET` precisam de 32 caracteres ou mais e não podem ser iguais. Gere cada uma com `openssl rand -hex 32`. Trocar o `PAGE_ACCESS_SECRET` invalida os PINs já criados.
- `MONGODB_URI` começa com `mongodb://` ou `mongodb+srv://`. No compose com MongoDB local, ela já vem fixa como `mongodb://mongo:27017`.

</details>

| Serviço | Domínio | Para quê |
| :--- | :--- | :--- |
| `ui` | `pocketrun.com` | Painel e `/llms.txt` |
| `api` | `api.pocketrun.com` | API pública e do painel |
| `api` | `link.pocketrun.com` | Links e páginas |

Todos os containers escutam na porta `80`.

> [!IMPORTANT]
> O backup do painel inclui os hashes das senhas e dos tokens. Guarde o arquivo fora do servidor. Para restaurar em outra instância, use os mesmos `JWT_SECRET` e `PAGE_ACCESS_SECRET`.
