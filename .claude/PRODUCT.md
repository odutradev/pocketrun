# Visão do produto PocketRun

Este arquivo descreve **o que é o PocketRun e quais são as regras de negócio dele**. É a referência de produto: leia antes de desenhar uma feature, nomear um conceito ou escrever texto voltado ao usuário, e atualize no mesmo trabalho quando uma regra mudar. As regras técnicas ficam em `.claude/CLAUDE.md`, `api/CLAUDE.md` e `ui/CLAUDE.md`. O uso dos serviços por quem integra (rotas, payloads e erros) fica no `llms.txt`.

## 1. Resumo em uma frase

**O PocketRun é um backend self-hosted para projetos pessoais: uma única instância dá a cada projeto seu próprio armazenamento de dados, suas micro-páginas e seus links curtos, tudo gerido por um só painel.**

"Pare de reinventar backends. Comece a construir produtos."

## 2. De onde ele vem

O PocketRun reúne dois projetos anteriores do mesmo autor num único produto:

| Origem | O que era | O que virou no PocketRun |
| :--- | :--- | :--- |
| **PocketDB API** (Node/Express/Mongoose) | Backend REST genérico. Cada projeto recebia um `projectID` e um JWT gerado por script de CLI. Os dados ficavam em collections key-value com CRUD genérico em `/kv/*`. | O serviço **KV**: o mesmo contrato `/kv/*`, reescrito em Go, com aplicações, tokens e cargos geridos pelo painel. |
| **Shareds** (app React sobre o PocketDB) | Gerenciador de micro-páginas e links de redirecionamento, com analytics e backup em JSON. Acesso admin por um PIN no env do frontend. | Os serviços **Páginas** e **Links**, nativos do PocketRun, atrás do login do gestor. |

Clientes do PocketDB continuam funcionando com mudanças mínimas: as rotas `/kv/*`, o header `controlAccess` e o corpo `{ "data": ..., "expiresInDays": N }` são compatíveis.

## 3. Para quem é

Um dev solo (ou time pequeno) que constrói muitas coisas pequenas e não quer um backend por projeto: protótipos e MVPs, apps pessoais (agenda, finanças, hábitos, lista de compras), projetos domésticos (estoque, família, filmes), projetos de estudo focados no frontend ou no mobile, freelas pequenos, e landing pages, promoções e links curtos para qualquer um deles. Funciona com qualquer cliente: React, Vue, Flutter, mobile, scripts.

## 4. Conceitos

| Conceito | Significado |
| :--- | :--- |
| **Gestor** | Pessoa que entra no painel. Cargos: **Gestor** (`admin`) cuida das próprias aplicações e de todas as páginas e links; **Superadmin** (`superadmin`) também gerencia usuários e backup. O primeiro superadmin nasce no setup. |
| **Aplicação** | Um projeto do KV, de um gestor. Tem nome, `projectId` único, descrição, origens permitidas, tokens e cargos. Existe só para o KV: as collections e os documentos pertencem a exatamente uma aplicação e são invisíveis para as outras. |
| **Aplicação da página** | Aplicação criada pela aba Dados de uma página, marcada **Da página**. Pertence à página, não pode ser excluída pelo KV e some junto com a página. |
| **Token de acesso** | Segredo `pk_live_...` que um cliente usa na API pública do KV. Guardado só como hash, exibido uma vez, com validade opcional, cargo, prefixo visível e último uso. |
| **Cargo do KV** | Permissões de uma aplicação: por collection (ou `*`), as operações ler, criar, editar e apagar, limite opcional de documentos e "só os próprios documentos". `admin` é fixo e tem acesso total. |
| **Collection** | Grupo nomeado de documentos dentro de uma aplicação. Nasce na primeira escrita, sem schema. |
| **Documento** | Objeto JSON livre (`data`) numa collection, com id, datas, o cargo que o criou (`createdByRole`) e validade opcional. |
| **Página** | Micro-página de um único HTML, publicada num slug no domínio dos links, com versões, PIN opcional e dados do KV sem token. Global da instância. |
| **Link** | Slug curto que redireciona (`302`) para uma URL externa. Global da instância: todo gestor vê e edita todos os links. |
| **Grupo** | Pasta que só organiza a lista de links ou de páginas (cada serviço tem os seus). Não isola nada e não tem token. |
| **Slug** | Endereço curto de um link ou página, único na instância inteira e dividido entre os dois. |
| **Ativação** | Regra que diz quando um link ou página está no ar: ativo, desativado, por período ou por acessos. |

## 5. Regras de negócio

### 5.1 Acesso ao painel

- **Sem cadastro público.** O único cadastro aberto é o setup inicial, que cria o primeiro superadmin e depois responde `setup_completed`. Os outros usuários são criados por um superadmin, com senha inicial.
- **Senha:** pelo menos 8 caracteres, com letras e números ou símbolos. Guardada com Argon2id; hashes antigos são convertidos no próximo login certo.
- **Sessão:** 7 dias num cookie `__Host-` `HttpOnly; Secure; SameSite=Strict` que o JavaScript não lê. Toda chamada do painel leva o header `X-Pocketrun-Client: panel`, contra CSRF.
- **Limite de login:** contam só as falhas. Por e-mail, 5 em 15 min, 10 em 1 h e 20 em 24 h; por IP, 20, 50 e 100 nas mesmas janelas. Passou disso, `429 too_many_login_attempts` com `Retry-After`. Um login certo zera as falhas daquele e-mail.
- **Encerrar sessões:** trocar a senha ou o cargo de alguém encerra as sessões dessa pessoa; **Sair de todos os dispositivos** encerra todas; trocar a própria senha mantém só a sessão atual.
- **Usuários** (só superadmin): listar, criar, editar nome, e-mail, cargo e senha, remover. Ninguém muda o próprio cargo nem remove a própria conta, e um usuário dono de aplicações não pode ser removido.
- **Perfil:** cada gestor edita o próprio nome e e-mail e troca a senha informando a atual.

### 5.2 Painel

- Menu lateral: **Início** (Geral e Documentação), **Serviços** (KV, Páginas e Links, cada um na cor da sua ferramenta) e **Painel** (Usuários e Backup, para superadmins), com perfil e saída embaixo. A raiz `/` abre a Geral, que também é a primeira tela depois de entrar.
- **Geral:** período de 24h, 7, 30, 90 dias ou Tudo (lembrado no navegador, 7 dias de início), números de aplicações (e quantas são de páginas), tokens ativos (e quantos vencem em breve), páginas, links e acessos. O gráfico **Uso dos serviços** junta pedidos ao KV, acessos às páginas e cliques nos links, com comparação ao período anterior e **Exportar CSV**. Os pedidos ao KV somam as rotas públicas (contadas por hora e aplicação, guardadas 400 dias, só das aplicações do gestor) e a ponte das páginas (30 dias). **Pontos de atenção:** tokens vencidos ou vencendo em até 14 dias e aplicações abertas a qualquer site.
- **Listas** de aplicações, páginas e links: busca, filtros, ordenação, paginação e lista ou cards (lembrado no navegador; no celular, sempre cards). Páginas e links também ligam e desligam direto da lista e copiam a URL pública.
- **Editores com abas**, com a aba na URL (`?tab=`), para mandar o link direto.
- **Documentação** (`/docs`): o guia de todo o PocketRun numa página só, com índice por serviço (Geral, KV, Páginas, Links e Painel). As seções seguem a ordem de `ui/src/assets/data/docs`. A seção **llms.txt** dá o link público `{painel}/llms.txt` para colar numa IA. O endereço antigo `/kv/docs` leva para `/docs`.

### 5.3 KV

**Aplicações e tokens**

- Criar, listar, editar e excluir aplicações fica na página do KV (`/kv`, `/kv/new`, `/kv/{id}/edit`), com as abas **Explorador**, **Configuração**, **Cargos**, **Tokens** e **Snippets**. O `projectId` é único na instância.
- Criar uma aplicação já gera um token `admin` de 365 dias. Novos tokens têm nome, validade de 0 a 3.650 dias (0 é sem validade) e cargo. O cargo de um token pode ser trocado, e revogar corta o acesso na hora.
- O token vai em `Authorization: Bearer`, `X-Pocket-Token` ou `controlAccess`. Token inexistente ou revogado: `401 invalid_access_token`; vencido: `401 expired_access_token`; com cargo apagado: `403 role_not_found`.
- **Origens:** chamadas de navegador só passam de uma origem da lista (ou `*`). Chamadas sem `Origin` só passam se a aplicação aceitar chamadas fora do navegador. Senão, `403 origin_not_allowed`.
- Excluir uma aplicação apaga os documentos dela e não tem volta. A aplicação de uma página só sai junto com a página (`409 application_owned_by_page`).

**Isolamento**

- A aplicação sai sempre do token, nunca da rota ou do corpo. Todo acesso a documentos é filtrado pelo `appId` da aplicação do token, e os filtros de quem chama valem só dentro de `data`, então não conseguem escapar desse escopo.
- Um token do KV não abre nenhuma rota do painel, e nada de uma aplicação aparece em outra: leitura, edição, contagem, cálculo, exportação, importação e limpeza.

**Cargos**

- Até 20 cargos por aplicação, cada um com até 30 regras. O nome segue as regras do slug, até 40 caracteres, e `admin` é reservado. Uma collection aparece no máximo uma vez nas regras.
- A regra da collection pelo nome vence a regra `*`. Sem regra que cubra a collection, ou sem a operação, a resposta é `403 forbidden_operation`.
- `read` cobre listar, ler, contar, calcular e exportar a collection. `create` cobre gravar e importar. `update` cobre `update` e `replace`. `delete` cobre apagar um documento.
- Limpar uma collection e as rotas de projeto (exportar, importar e apagar tudo) são só do `admin`. Um cargo próprio nunca ganha essa permissão.
- **Limite de documentos** (`maxDocuments`) por regra: gravar ou importar além dele dá `409 collection_full`. O `admin` não tem limite, e a importação de projeto não confere limite, porque só o `admin` faz.
- **Só os próprios documentos:** o cargo vê, edita e apaga só o que foi criado com esse mesmo cargo (`createdByRole`). A posse é do cargo, não do token: dois tokens com o mesmo cargo dividem os documentos. Documento de outro cargo responde `404 document_not_found`.
- Um cargo em uso por um token não pode ser apagado (`409 role_in_use`). Mudar as regras vale no próximo pedido.

**Documentos**

- Nome da collection: letras, números, `_` e `-`, até 64 caracteres. `project` é reservado.
- Corpo JSON de até 1 MB (8 MB na importação). `data` é obrigatório e livre.
- **Validade:** `expiresInDays` (0 a 3.650; 0 tira a validade) ou `expiresAt`. O documento some sozinho, com até cerca de 1 minuto de atraso. Na edição, sem nenhum dos dois, a validade atual fica.
- **Listar:** do mais novo ao mais antigo, com paginação opcional (`limit` de 1 a 500, padrão 50), filtros de igualdade sobre `data` e operadores `__gt`, `__gte`, `__lt`, `__lte`, `__ne`, `__contains` (até 100 caracteres, sem diferenciar maiúsculas) e `__exists`, recorte por `createdAfter` e `createdBefore`, e ordem por `createdAt`, `updatedAt`, `expiresAt` ou campo de `data`. Valor entre aspas é sempre texto.
- **Calcular:** `count` e `eval` (`sum`, `avg`, `min`, `max`, `count` e `distinct`, este com até 1.000 valores), com os mesmos filtros.
- **Importar e exportar:** JSON ou CSV (com proteção contra fórmulas), até 5.000 itens por importação. Um item pode ser um objeto puro ou um documento exportado, que mantém criação e validade. Cada item vira um documento novo.
- Toda chamada pública com token é contada por hora e por aplicação para a página Geral.

### 5.4 Páginas

- **Conteúdo:** um único HTML de até 512 KB, com o estilo e o script dentro dele. Um trecho solto ganha um esqueleto com `charset`, `viewport` e título. Uma página nova nasce de um modelo: **Em branco** ou **CRUD com KV** (`/pages/new?template=kvCrud`).
- **Abas:** Editor, Configuração, Versões, Acesso, Dados, QR code, Análise e Histórico. Grupos próprios, como os links.
- **Editor:** Monaco com prévia ao lado num `iframe` isolado (no celular, alterna). `Ctrl+S` salva, `Shift+Alt+F` formata, avisos de HTML comum (tag sem fechamento, `</br>`, comentário aberto), aviso ao sair com alterações e rascunho no navegador, oferecido de volta ao reabrir.
- **Versões:** cada salvamento que muda o HTML cria uma versão (1.0, 1.1, 1.2…), com quem salvou, tamanho e mensagem opcional de até 80 caracteres. Ficam as últimas 50; a versão no ar nunca sai. A aba Versões compara e restaura; restaurar vira uma versão nova, marcada como restaurada.
- **Runtime:** toda página entregue (e a prévia) recebe no `<head>` um `window.pocketrun` congelado com `apiVersion`, `page` (slug, título, versão, data, prévia), `access` (protegida e cargo do PIN: `""` no PIN geral, `null` sem proteção) e `kv`. Nunca é gravado no HTML e não sobrescreve um `window.pocketrun` da própria página.
- **Acesso com PIN:** PINs de 6 números, sem sequências nem repetidos: um PIN geral opcional e PINs por cargo (nome com as regras do slug), até 20 no total, todos diferentes. A API guarda um HMAC e uma cópia cifrada (AES-256-GCM), com chaves de `PAGE_ACCESS_SECRET`; o gestor pode ver e copiar de novo, e cada visualização entra no histórico. O HTML só sai do servidor depois do PIN certo. O acesso fica num cookie assinado da página pela duração escolhida (1 hora a 30 dias, 1 dia de início; diminuir encurta os acessos abertos). Trocar o PIN de um cargo encerra os acessos dele; desligar a proteção ou **Encerrar todos os acessos** encerra todos. Falhas: por visitante e página, 5 em 15 min, 10 em 1 h e 20 em 24 h; 50 falhas da página em 1 h fecham a tela de PIN para todos e entram no histórico. O primeiro PIN liga a proteção, e o último não sai com ela ligada. Indicado para conteúdo de equipe, não para dados sensíveis.
- **Dados com `pocketrun.kv`:**
  - **Ativar dados** cria a aplicação da página (Project ID `page-{id}`, nome "Página {título}", sem token nem origens) com os cargos `leitura` (ler), `escrita` (ler, criar, editar) e `gestao` (também apagar) em `*`.
  - Quem abre sem PIN começa com `leitura`, e o PIN geral e cada PIN de cargo com `escrita`. O gestor troca o cargo de cada um, ou deixa "sem acesso aos dados" (`403 kv_access_denied`), e edita as regras no KV.
  - Desativar mantém os documentos e os cargos; excluir a página apaga a aplicação e os documentos.
  - As chamadas vão para `{dominio}/{slug}/_/kv/...`, com o header `X-Pocketrun-Page: 1` e da mesma origem (senão `403 invalid_client`). O cargo vem do cookie do PIN, nunca de um token no HTML. Página com PIN e sem sessão: `401 page_locked`.
  - Só operações de documento (listar, ler, contar, calcular, criar, editar, trocar, apagar); limpar, importar e exportar ficam de fora. Corpo até 256 KB. Limite de 120 pedidos por minuto por visitante e 1.200 pela página (`429 too_many_requests`).
  - Trocar PIN, encerrar acessos, mudar cargos ou desligar os dados vale no próximo pedido.
  - Cada pedido, da página e da prévia, fica registrado por 30 dias na aba Dados, com o cargo e o resultado. Na prévia, as chamadas passam pelo painel com o cargo escolhido em **Ver como**.
- **Fora da regra de ativação**, a página responde 404 com a tela "Página indisponível", e o slug continua reservado.

### 5.5 Links

- Título, slug, URL de destino, grupo e ativação, numa só tela de criar e editar (`/links/new`, `/links/{id}/edit`), com as abas Configuração, QR code, Análise e Histórico. O "Novo link" aberto dentro de um grupo já vem com ele.
- **Destino:** URL `http` ou `https`, que não pode apontar para o próprio encurtador (o host da API ou o de `LINKS_URL`): `400 self_redirect`.
- **Redirecionamento:** `302` com `Cache-Control: no-store` e contagem atômica. O slug aceita maiúsculas e barra no final (`/Promo/` abre `promo`), e os parâmetros do endereço vão para o destino, trocando os de mesmo nome. Robôs, prévias de link e `HEAD` também são redirecionados.
- **QR code** do link curto em PNG (256 a 2048 px, correção de erros, margem, fundo transparente) ou SVG. Os acessos pelo QR entram na análise.
- **Grupos** com nome, uma de oito cores e um de dezesseis ícones, cada um com a sua página (`/links/groups/{id}`, abas Links e Configurações). Excluir um grupo deixa os itens sem grupo e registra isso no histórico.
- **Fora da regra de ativação**, o link responde 404 com a tela "Link indisponível", e o slug continua reservado.

### 5.6 Slugs e domínios

- **Slug:** letras minúsculas, números e hífen, até 64 caracteres, único na instância e dividido entre links e páginas. Pode ser sorteado (8 caracteres) ou escolhido, e a disponibilidade é conferida enquanto o gestor digita. Nomes reservados: `admin`, `api`, `apps`, `auth`, `healthz`, `kv`, `links`, `pages`, `ping`, `setup`, `static` e `validate`.
- **Domínios:** o painel, a API (`{api}`) e o domínio de links e páginas (`LINKS_URL`, `{dominio}`).
- `LINKS_URL` é obrigatório, e links e páginas só abrem nele, para o HTML do usuário nunca rodar no domínio da API. Em `{api}/{slug}`, a resposta é `404` com a tela "Link indisponível", e a raiz `/` dos dois domínios mostra a mesma tela. No domínio de links, os caminhos que não são de slug (`/kv`, `/admin`, `/ping`) seguem para a API, então o desenvolvimento local funciona com `LINKS_URL` igual à URL da API.
- O KV fica sempre em `{api}`, e o painel usa as rotas `/admin` da mesma API, com CORS próprio.

### 5.7 Ativação e contagem

- Vale igual para links e páginas. **Ativo** e **desativado**: no ar ou fora do ar. **Por período**: no ar até o fim, que é obrigatório, com início opcional antes do fim. **Por acessos**: no ar até o limite (`maxClicks`, pelo menos 1).
- Estados mostrados: ativo, desativado, agendado, expirado e esgotado.
- No modo por acessos, a contagem é **por clique** (cada abertura conta) ou **por visitante único** (cada pessoa conta uma vez, pela impressão HMAC de IP e navegador guardada por item, sem guardar o IP). Os cliques continuam sendo contados nos dois modos.
- Robôs, prévias de link e `HEAD` nunca gastam o limite.
- Agenda inválida (período sem fim, início depois do fim, acessos sem limite): `400 invalid_schedule`.
- O fim do período e o limite atingido entram no histórico como eventos do sistema.

### 5.8 Análise e histórico

- **Aberturas:** cada uma grava data, origem (só o domínio), dispositivo, sistema, navegador e um visitante anônimo (hash de IP e navegador com sal que troca todo dia; o IP nunca é guardado). Robôs e prévias ficam fora dos números. Guardadas por 12 meses; somem quando o item é excluído.
- **Painel de análise** por item e geral (`/links/analytics`, `/pages/analytics`): período de 24h a Tudo, cliques, visitantes únicos e média por dia comparados ao período anterior, último acesso, progresso do limite ou do período, gráfico com as alterações marcadas, mapa de calor por dia e hora, origens, dispositivos, sistemas, navegadores, mais acessados e CSV.
- **Histórico:** toda criação, edição e exclusão de link ou página grava quem alterou (nome e e-mail copiados na hora) e o antes e depois de cada campo, além dos eventos do sistema e, nas páginas, dos acessos com PIN, das mudanças de PIN e dos dados. A troca de código aparece como "Versão do código: 1.2 → 1.3". O histórico continua depois que o item é excluído.

### 5.9 Backup

- Só superadmin, na tela **Backup**. **Exportar** baixa a instância inteira num `.jsonl.gz`: cabeçalho com formato, versão, data e contagens, um documento por linha em Extended JSON canônico e uma linha final com a contagem exata.
- Sempre vão usuários, aplicações e documentos do KV, grupos, slugs, links, páginas com versões, PINs e dados. **Incluir análise e histórico** (ligado de início) junta aberturas, uso do KV, pedidos das páginas, visitantes únicos e histórico. Tentativas de login e de PIN nunca vão.
- **Restaurar** recebe o arquivo (até 2 GB, compactado ou não), mostra antes a data, o tipo e as contagens e pede que se digite `restaurar`. Grava em coleções temporárias e troca cada coleção do arquivo só no fim. Arquivo inválido, cortado ou sem superadmin não muda nada. Só as coleções do arquivo são trocadas, e roda uma restauração por vez.
- O arquivo tem os hashes das senhas e dos tokens e deve ficar fora do servidor. Para os PINs e os visitantes únicos continuarem valendo, o destino precisa dos mesmos `JWT_SECRET` e `PAGE_ACCESS_SECRET`.

## 6. Qualidade

- As regras acima que protegem dados têm teste automatizado em `api/tests`: isolamento entre aplicações, cargos, ativação, contagem, limites da ponte e do login.
- O CI roda formatação, `go vet`, testes, lint e build a cada push e pull request. Uma versão só vira imagem no Docker Hub se tudo passar.

## 7. Princípios do produto

1. **Uma instância, muitos projetos.** Adicionar um projeto custa um clique no painel, nunca um servidor novo.
2. **Isolamento por padrão.** Nada de uma aplicação pode ser lido ou escrito com o token de outra.
3. **Zero código de backend para o usuário.** Um cliente ganha um backend funcionando a partir de um token e dos snippets do painel.
4. **Segredos nunca saem do servidor em texto puro.** Tokens e senhas ficam em hash, o token puro aparece uma vez só, e nenhum token vai para o HTML de uma página.
5. **Compatível com o que já existe.** Clientes do PocketDB e dados do Shareds devem migrar sem reescrita.
6. **O painel é a central de controle.** Tudo que antes exigia script de CLI, variável de ambiente ou acesso direto ao banco pertence ao painel.
7. **Self-hosted e barato.** Roda como uma stack Docker Compose com MongoDB (local ou Atlas), com deploy no Dokploy.

## 8. Limites conhecidos e decisões em aberto

- Todas as páginas dividem o mesmo domínio: o HTML de uma página consegue chamar a ponte de outra com o cookie de quem abriu as duas. Por isso a recomendação é usar cargos pequenos por página e não ligar dados sensíveis a páginas públicas.
- Um token usado no navegador é público. A lista de origens só segura navegadores; dados sensíveis devem passar por um servidor do usuário.
- Ainda sem upload de arquivos, que existia no PocketDB. Falta decidir se volta e onde os arquivos ficam.
- Falta decidir como importar os dados atuais do Shareds, que vivem em collections do PocketDB.
- Tempo na página e pings de atividade ficaram de fora da análise por decisão do dono.
