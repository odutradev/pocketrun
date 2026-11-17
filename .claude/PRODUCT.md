# Visão do produto PocketRun

Este arquivo descreve **o que é o PocketRun e para onde ele vai**. É a referência de produto: leia antes de desenhar uma feature, nomear um conceito ou escrever texto voltado ao usuário. As regras técnicas ficam em `.claude/CLAUDE.md`, `api/CLAUDE.md` e `ui/CLAUDE.md`.

## 1. Resumo em uma frase

**O PocketRun é um backend self-hosted para projetos pessoais: uma única instância dá a cada projeto seu próprio armazenamento de dados, suas micro-páginas e seus links curtos, tudo gerido por um só painel.**

"Pare de reinventar backends. Comece a construir produtos."

## 2. De onde ele vem

O PocketRun reúne dois projetos anteriores do mesmo autor em um único produto robusto:

| Origem | O que era | O que vira no PocketRun |
| :--- | :--- | :--- |
| **PocketDB API** (Node/Express/Mongoose) | Backend REST genérico. Cada projeto recebia um `projectID` e um JWT gerado por script de CLI (`npm run control-access`). Os dados ficavam em "collections" key-value com CRUD genérico em `/kv/*`. | O módulo **Dados**: o mesmo contrato `/kv/*`, reescrito em Go, com aplicações, tokens e regras de acesso geridos pelo painel em vez de uma CLI. |
| **Shareds** (app React sobre o PocketDB) | Gerenciador de micro-páginas (HTML/CSS/JS escritos num editor no navegador) e links de redirecionamento, com analytics de acesso e backup em JSON. Acesso admin por um PIN guardado no env do frontend. | O módulo **Páginas & Links**: uma feature nativa do PocketRun, atrás do login do gestor, sem token nem PIN embutido no bundle do frontend. |

Clientes que usavam o PocketDB devem continuar funcionando com mudanças mínimas: as rotas `/kv/*`, o header `controlAccess` e o corpo `{ "data": ..., "expiresInDays": N }` continuam compatíveis.

## 3. Para quem é

Um dev solo (ou time pequeno) que constrói muitas coisas pequenas e não quer um backend por projeto:

- Protótipos e MVPs.
- Apps pessoais: agenda, finanças pessoais, hábitos, lista de compras, diário.
- Projetos domésticos: controle de estoque, organização da família, lista de filmes.
- Projetos de estudo: foco no frontend ou no mobile, não no backend.
- Freelas pequenos que precisam de algo no ar rápido.
- Landing pages, páginas de promoção e links curtos para qualquer um dos itens acima.

Funciona com qualquer cliente: React, Vue, Flutter, mobile, scripts.

## 4. Conceitos principais

| Conceito | Significado |
| :--- | :--- |
| **Gestor** | Pessoa que entra no painel (JWT). O primeiro gestor é criado pelo fluxo de setup (`/setup/*`). Um gestor é dono de aplicações. |
| **Aplicação** | Um projeto. Tem nome, `projectId` único, descrição, origens permitidas e tokens de acesso. Todos os dados, páginas e links pertencem a exatamente uma aplicação e são invisíveis para as outras. |
| **Token de acesso** | Segredo usado por um app cliente para chamar a API pública. Formato `pk_live_...`, guardado só como hash, exibido uma única vez na criação, validade opcional, revogável, com registro de último uso. Enviado como `controlAccess`, `X-Pocket-Token` ou `Authorization: Bearer`. |
| **Origens permitidas** | Lista de CORS por aplicação. Chamadas de navegador de outras origens são recusadas. Chamadas sem header `Origin` só passam se a aplicação liberar requisições fora do navegador. |
| **Collection** | Grupo nomeado de documentos dentro de uma aplicação, como uma tabela. É criada na primeira escrita, sem schema. |
| **Documento** | Um objeto JSON livre (`data`) dentro de uma collection, com id, datas e validade opcional (`expiresInDays`), após a qual é apagado. |
| **Página** *(planejado)* | Uma micro-página feita de HTML, CSS e JS, publicada num slug. |
| **Link** *(planejado)* | Um slug curto que redireciona para uma URL externa. |

## 5. Módulos e status

### 5.1 Plataforma (pronto)

- Setup inicial que cria o primeiro gestor.
- Login, cadastro e sessão do gestor (`/auth/*`).
- Aplicações: criar, listar, ver detalhes, editar, excluir (`/apps/*`).
- Tokens por aplicação: criar com nome e validade, revogar, ver prefixo e último uso.
- Controle de CORS por aplicação e opção de liberar acesso fora do navegador.
- Dois modos de deploy com uma só imagem: `public` (tráfego dos clientes) e `admin` (tráfego do painel).

### 5.2 Dados, antigo PocketDB (pronto)

API pública, autenticada por token da aplicação:

- `GET /ping`, `GET /validate/control-access`.
- `POST /kv/{collection}/create`
- `GET /kv/{collection}/get-all`, com `page`, `limit`, `pagination` e qualquer outro query param como filtro de igualdade sobre `data`.
- `GET /kv/{collection}/get/{id}`
- `PATCH /kv/{collection}/update/{id}`
- `DELETE /kv/{collection}/delete/{id}`
- `DELETE /kv/{collection}/delete-all`
- `DELETE /kv/project/delete-all`

No painel, por aplicação: **explorador** de dados (collections e documentos), **tokens**, **segurança** (origens), **snippets** de código para integrar um cliente e **zona de perigo**.

Ainda não trazido do PocketDB: upload de arquivos.

### 5.3 Páginas & Links, antigo Shareds (planejado)

Conteúdo:

- Páginas com HTML, CSS e JS editados num editor de código (Monaco) dentro do painel.
- Links de redirecionamento para URLs externas.
- Slug personalizado ou id aleatório para cada página ou link.
- Ativar ou desativar uma página ou link na hora.

Analytics:

- Visualizações por dia nos últimos 14 dias (gráfico de área).
- Tempo médio e total na página, a partir de pings de atividade enviados pela página publicada.
- Total de visualizações, pings e status de cada item.

Administração:

- Exportar todas as páginas, links e métricas de uma aplicação em JSON e restaurar a partir desse arquivo.

Diferenças em relação ao Shareds que o tornam robusto:

- O acesso é o login do gestor, não um PIN no env do frontend.
- Nenhum token de aplicação vai para um bundle de navegador: o painel usa a API admin.
- Páginas e links pertencem a uma aplicação, assim como as collections.
- Servir páginas, redirecionar e contar visualizações é trabalho da API, não de um app React separado.

## 6. Princípios do produto

1. **Uma instância, muitos projetos.** Adicionar um projeto custa um clique no painel, nunca um servidor novo.
2. **Isolamento por padrão.** Nada de uma aplicação pode ser lido ou escrito com o token de outra.
3. **Zero código de backend para o usuário.** Um cliente ganha um backend funcionando a partir de um token e dos snippets do painel.
4. **Segredos nunca saem do servidor em texto puro.** Tokens são guardados em hash; o token puro aparece uma vez só.
5. **Compatível com o que já existe.** Clientes do PocketDB e dados do Shareds devem migrar sem reescrita.
6. **O painel é a central de controle.** Tudo que antes exigia script de CLI, variável de ambiente ou acesso direto ao banco pertence ao painel.
7. **Self-hosted e barato.** Roda como uma stack Docker Compose com MongoDB (local ou Atlas), com deploy no Dokploy.

## 7. Decisões de produto em aberto

Resolver com o usuário antes de construir Páginas & Links:

- Onde páginas e links são servidos: um caminho na API pública (`/p/{slug}`), um domínio dedicado ou os dois.
- Se o slug é único por aplicação ou na instância inteira (um domínio curto exige slug único na instância).
- Como importar os dados atuais do Shareds (hoje eles vivem em collections do PocketDB).
- Se o upload de arquivos do PocketDB volta e onde os arquivos ficam guardados.
