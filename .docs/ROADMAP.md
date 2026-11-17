# Roadmap de implementações do PocketRun

Lista do que falta construir para o PocketRun cumprir a visão descrita em `.claude/PRODUCT.md`.

## ⚠️ Regra de execução

**Somente o dono do projeto decide o que é executado deste roadmap.**

- Nenhum item é iniciado por conta própria, nem por sugestão, nem por "já que estou aqui", nem porque é o próximo da lista.
- Um item só é executado quando o dono pede explicitamente pelo número (ex: "execute o 3.2").
- Executar um item não autoriza executar outro, mesmo que seja dependência ou continuação. Se faltar uma dependência, avise e pergunte.
- A ordem da lista é uma sugestão, não um plano aprovado.
- Ao concluir um item, marque o status como `✅ Feito` neste arquivo, no mesmo trabalho.

**Status:** `⬜ Pendente` · `🔄 Em andamento` · `✅ Feito`

---

## 1. Decisões de produto

Itens de conversa, não de código: discutir com o dono e registrar a decisão em `.claude/PRODUCT.md` (seção 7).

- **1.1** ⬜ Registrar em `.claude/PRODUCT.md` onde páginas e links são servidos. Direção já escolhida pelo dono: domínio dedicado, servido pela mesma API (ver a regra na seção 3).
- **1.2** ⬜ Definir se o slug é único por aplicação ou na instância inteira.
- **1.3** ⬜ Definir como importar os dados atuais do Shareds (collections do PocketDB).
- **1.4** ⬜ Definir se o upload de arquivos volta e onde os arquivos ficam guardados (MongoDB GridFS, disco, S3 compatível).

## 2. Documentação e processo

- **2.1** ⬜ Criar a referência da API pública (OpenAPI) com rotas `/kv/*`, `/validate/*` e `/ping`, payloads e códigos de erro.
- **2.2** ⬜ Substituir o `ui/README.md`, que ainda é o template do Vite, por um README do painel.
- **2.3** ⬜ Escrever o guia de migração PocketDB → PocketRun (troca de URL e de token, o que muda e o que é compatível).
- **2.4** ⬜ Adotar o fluxo SDD: pasta `.claude/specs/<feature>/` com `requirements.md`, `design.md` e `tasks.md`, e a regra no `CLAUDE.md` de aprovar a spec antes do código.

## 3. Páginas & Links: API

Depende de 1.1 e 1.2.

**Regra de negócio:** não existe um segundo front nem um serviço separado para páginas e links.

- A mesma API em Go serve tudo. Páginas e links são um grupo de rotas próprio no código, ao lado das rotas públicas e das rotas `/admin`.
- Páginas e links ficam num domínio só deles (ex: `s.odutra.com`), configurado por variável de ambiente. Esse domínio aponta para o mesmo container `api`, e a API escolhe o grupo de rotas pelo host da requisição.
- O domínio próprio é obrigatório por segurança. As páginas executam HTML e JS escritos pelo usuário, e no mesmo domínio do painel ou da API esse JS teria acesso à sessão do gestor.
- A API entrega o HTML da página já montado, com cache e headers de segurança (CSP). O redirect é uma resposta `302` do servidor, nunca feito em JavaScript no navegador, para ser instantâneo e funcionar com robôs e prévias de link.
- Como todas as aplicações compartilham o mesmo domínio, o slug tem que ser único na instância inteira (resposta do 1.2).

- **3.1** ⬜ Criar o domínio de páginas: modelo (slug, HTML, CSS, JS, ativo, datas), repositório e índice de slug, vinculado à aplicação.
- **3.2** ⬜ Criar o domínio de links: modelo (slug, URL de destino, ativo, datas), repositório e índice de slug, vinculado à aplicação.
- **3.3** ⬜ Rotas admin de páginas: listar, criar, ver, editar, excluir, ativar e desativar.
- **3.4** ⬜ Rotas admin de links: listar, criar, ver, editar, excluir, ativar e desativar.
- **3.5** ⬜ Geração de slug aleatório e validação de slug personalizado (formato, palavras reservadas, unicidade).
- **3.6** ⬜ Rota pública que serve a página pelo slug, montando HTML, CSS e JS, com headers de segurança.
- **3.7** ⬜ Rota pública de redirecionamento pelo slug do link.
- **3.8** ⬜ Roteamento por host na API: variável de ambiente com o domínio de páginas e links (em `.env.example` e no compose), grupo de rotas servido só nesse domínio, e o passo a passo do domínio extra no Dokploy no `README.md`.

## 4. Páginas & Links: painel

Depende dos itens da seção 3 correspondentes.

- **4.1** ⬜ Aba de páginas e links nos detalhes da aplicação, com listagem, status e ações.
- **4.2** ⬜ Editor de página com Monaco (abas HTML, CSS e JS) e pré-visualização.
- **4.3** ⬜ Formulário de criação e edição de link.
- **4.4** ⬜ Ativar e desativar página ou link direto da listagem, e copiar a URL pública.

## 5. Analytics

Depende de 3.6 e 3.7.

- **5.1** ⬜ Registrar visualização a cada acesso de página e de link.
- **5.2** ⬜ Script de ping de atividade injetado nas páginas publicadas, e rota pública que recebe os pings.
- **5.3** ⬜ Rotas admin de métricas: visualizações por dia (14 dias), tempo médio e total, total de pings, por item e por aplicação.
- **5.4** ⬜ Dashboard no painel com gráfico de área dos últimos 14 dias.
- **5.5** ⬜ Métricas por página e por link na tela de detalhes do item.

## 6. Backup e migração

- **6.1** ⬜ Exportar páginas, links e métricas de uma aplicação em JSON. Depende das seções 3 e 5.
- **6.2** ⬜ Restaurar uma aplicação a partir do JSON exportado. Depende de 6.1.
- **6.3** ⬜ Importar os dados do Shareds para Páginas & Links. Depende de 1.3 e da seção 3.

## 7. Dados (ex-PocketDB)

- **7.1** ⬜ Upload de arquivos por aplicação, com limite de tamanho e listagem no painel. Depende de 1.4.

## 8. Qualidade

- **8.1** ⬜ Testes automatizados de isolamento: garantir que o token de uma aplicação nunca lê nem escreve dados, páginas ou links de outra.
