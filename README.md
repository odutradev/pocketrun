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

O painel abre em `http://localhost:3000`, e o primeiro acesso cria o superadmin. A API fica em `http://localhost:5000`.

| Script | O que faz |
| :--- | :--- |
| `npm run dev` | Sobe a API e o painel. |
| `npm run build` | Compila os dois apps e sincroniza o `llms.txt`. |
| `npm run up` | Sobe tudo com Docker Compose. |
| `npm run reset` | Apaga o banco local. `reset:admin` também cria `admin@pocketrun.local` com a senha `1234`. |

## Deploy

As imagens são publicadas no Docker Hub a cada versão:

```text
odutradev/pocketrun-api:latest
odutradev/pocketrun-ui:latest
```

<details>
<summary><b>docker-compose.yml</b></summary>

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
    dns:
      - 8.8.8.8
      - 1.1.1.1
    networks:
      - app-network

  ui:
    image: odutradev/pocketrun-ui:latest
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

</details>

<details>
<summary><b>Variáveis de ambiente</b></summary>

```env
VITE_API_URL=https://api.pocketrun.com
LINKS_URL=https://link.pocketrun.com
CORS_ALLOWED_ORIGINS=*
ADMIN_CORS_ALLOWED_ORIGINS=https://pocketrun.com
MONGODB_URI=mongodb+srv://usuario:senha@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGODB_NAME=pocketrun
JWT_SECRET=gere_uma_chave_secreta_forte
PAGE_ACCESS_SECRET=gere_outra_chave_longa_e_aleatoria
```

- `LINKS_URL` é o domínio dos links e das páginas, para o HTML delas nunca rodar no domínio da API. Com ele definido, `api.pocketrun.com/{slug}` responde `404`, e a raiz `/` dos dois domínios mostra a tela de não encontrado.
- `ADMIN_CORS_ALLOWED_ORIGINS` é a origem exata do painel. Nunca use `*`, porque o painel entra com cookie.
- `PAGE_ACCESS_SECRET` deve ser diferente do `JWT_SECRET`. Trocar essa chave invalida os PINs já criados.

</details>

| Serviço | Domínio | Para quê |
| :--- | :--- | :--- |
| `ui` | `pocketrun.com` | Painel e `/llms.txt` |
| `api` | `api.pocketrun.com` | API pública e do painel |
| `api` | `link.pocketrun.com` | Links e páginas |

Todos os containers escutam na porta `80`.

> [!NOTE]
> A imagem da UI é compilada sem `VITE_API_URL`. Para usar outros domínios, gere a imagem com `--build-arg VITE_API_URL=...` e `--build-arg VITE_LINKS_URL=...`, ou suba com o `docker-compose.yml` do repositório.

> [!IMPORTANT]
> O backup do painel inclui os hashes das senhas e dos tokens. Guarde o arquivo fora do servidor. Para restaurar em outra instância, use os mesmos `JWT_SECRET` e `PAGE_ACCESS_SECRET`.
