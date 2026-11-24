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

## O que é

O PocketRun é um backend que você hospeda no seu próprio servidor e que atende a todos os seus projetos pequenos ao mesmo tempo. Em vez de criar uma API, um banco, um site e um encurtador para cada ideia, você sobe uma instância só e cria um projeto novo pelo painel em segundos.

Cada instância oferece três serviços, geridos por um painel web com login:

- **Guardar dados (KV):** cada projeto vira uma **aplicação** com os próprios documentos JSON e um token de acesso. O seu frontend, app mobile ou script lê e grava pela API HTTP, sem você escrever backend. Uma aplicação nunca vê os dados de outra.
- **Publicar páginas:** você escreve um HTML (com CSS e JS) no editor do painel e ele fica no ar num endereço curto, como `link.pocketrun.com/promo`. A página pode pedir um PIN e guardar dados no KV pelo `pocketrun.kv`, sem expor token.
- **Encurtar links:** `link.pocketrun.com/cv` redireciona para qualquer URL, com QR code e contagem de acessos.

Páginas e links podem entrar no ar e sair sozinhos, por período ou depois de um número de acessos. Todos mostram quantas pessoas acessaram, de onde vieram e em qual aparelho.

### Para quem é

Para quem cria muitos projetos pequenos e não quer manter um backend para cada um: protótipos e MVPs, apps pessoais (finanças, hábitos, lista de compras), projetos de estudo focados no frontend ou no mobile, freelas pequenos, landing pages e links de divulgação. Funciona com qualquer cliente que fale HTTP: React, Vue, Flutter, apps mobile e scripts.

### Exemplo

Você está fazendo um app de lista de compras em React:

1. No painel, cria a aplicação **Compras**. Ela já vem com um token de acesso.
2. No app, grava um item com `POST /kv/itens/create` e lista com `GET /kv/itens/get-all`, mandando o token no header.
3. Para divulgar, publica uma página `/compras` e um link `/baixar` para a loja de apps, e vê os acessos de cada um no painel.

## Módulos

| | Módulo | O que faz |
| :-: | :--- | :--- |
| 🟦 | **KV** | Documentos JSON sem schema, separados por aplicação e por collection. Tokens com cargos (o que cada um pode ler, criar, editar e apagar), filtros, agregações, validade dos documentos e importação/exportação. |
| 🟨 | **Páginas** | Micro-páginas em HTML/CSS/JS publicadas num slug. Têm histórico de versões, PIN opcional, dados próprios pelo `pocketrun.kv`, ativação e análise de acessos. |
| 🟩 | **Links** | Links curtos com grupos, QR code, ativação por período ou por cliques e análise de acessos. |

O **painel** junta tudo isso: visão geral do uso, usuários (gestores e superadmins), backup da instância e a documentação de cada serviço.

> [!TIP]
> O [`llms.txt`](llms.txt) descreve cada rota, payload e erro dos serviços. Cole o link `{painel}/llms.txt` numa IA junto com o seu pedido, e ela consegue montar o cliente ou a página para você.

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

O [`docker-compose.yml`](docker-compose.yml) da raiz, usado no Dokploy, compila as imagens a partir do código e sobe o MongoDB junto, como o exemplo com MongoDB local abaixo. Nele a API sempre usa `mongodb://mongo:27017`, e o `MONGODB_URI` do `.env` é ignorado.

<details>
<summary><b>docker-compose.yml com MongoDB local</b></summary>

O banco roda no mesmo compose. Copie o [`.env.selfhost.example`](.env.selfhost.example) para `.env` ao lado do compose e preencha os segredos. Os dados ficam no volume `mongo-data` e não somem ao recriar o container. A API só sobe depois que o banco responde ao healthcheck.

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
      - ALLOW_HTTP=${ALLOW_HTTP}
      - MONGODB_URI=${MONGODB_URI}
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
      api:
        condition: service_healthy
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
      - ALLOW_HTTP=${ALLOW_HTTP}
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
      api:
        condition: service_healthy
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
ALLOW_HTTP=false
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
- `ALLOW_HTTP` diz se o login do painel funciona em HTTP. Com `false`, o cookie de sessão só vai por HTTPS, e o login falha num domínio sem HTTPS. Use `true` só enquanto o domínio não tiver HTTPS, como os `*.traefik.me` que o Dokploy gera: em HTTP, quem estiver na mesma rede pode copiar a sessão. Ligue o HTTPS no domínio e volte para `false` assim que puder.
- `JWT_SECRET` e `PAGE_ACCESS_SECRET` precisam de 32 caracteres ou mais e não podem ser iguais. Gere cada uma com `openssl rand -hex 32`. Trocar o `PAGE_ACCESS_SECRET` invalida os PINs já criados.
- `MONGODB_URI` começa com `mongodb://` ou `mongodb+srv://`. No compose com MongoDB local, use `mongodb://mongo:27017`.

</details>

| Serviço | Domínio | Para quê |
| :--- | :--- | :--- |
| `ui` | `pocketrun.com` | Painel e `/llms.txt` |
| `api` | `api.pocketrun.com` | API pública e do painel |
| `api` | `link.pocketrun.com` | Links e páginas |

Todos os containers escutam na porta `80`.

> [!IMPORTANT]
> O backup do painel inclui os hashes das senhas e dos tokens. Guarde o arquivo fora do servidor. Para restaurar em outra instância, use os mesmos `JWT_SECRET` e `PAGE_ACCESS_SECRET`.

## Mais

- [Histórico de versões](CHANGELOG.md): o que muda em cada versão. Leia antes de atualizar uma instância.
- [Segurança](SECURITY.md): como reportar uma vulnerabilidade.
- [Licença](LICENSE): ISC.
