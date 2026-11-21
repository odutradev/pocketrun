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
| **Gestor** | Pessoa que entra no painel (JWT num cookie `HttpOnly`). O primeiro gestor é criado pelo fluxo de setup (`/setup/*`) como superadmin. Um gestor é dono de aplicações. Cargos: **Gestor** (`admin`) cuida das próprias aplicações; **Superadmin** (`superadmin`) também gerencia os usuários. |
| **Aplicação** | Um projeto do KV. Tem nome, `projectId` único, descrição, origens permitidas e tokens de acesso. A aplicação existe só para o KV: as collections e os documentos pertencem a exatamente uma aplicação e são invisíveis para as outras. Páginas e links não pertencem a aplicações. |
| **Token de acesso** | Segredo usado por um app cliente para chamar a API pública. Formato `pk_live_...`, guardado só como hash, exibido uma única vez na criação, validade opcional, revogável, com registro de último uso e um cargo do KV. Enviado como `controlAccess`, `X-Pocket-Token` ou `Authorization: Bearer`. |
| **Cargo do KV** | Conjunto de permissões de uma aplicação: para cada collection (ou `*`), as operações ler, criar, editar e apagar, com limite opcional de documentos e a opção "só os próprios documentos". O cargo `admin` é o acesso total e o dos tokens antigos. Tokens e páginas ligadas usam cargos. |
| **Origens permitidas** | Lista de CORS por aplicação. Chamadas de navegador de outras origens são recusadas. Chamadas sem header `Origin` só passam se a aplicação liberar requisições fora do navegador. |
| **Collection** | Grupo nomeado de documentos dentro de uma aplicação, como uma tabela. É criada na primeira escrita, sem schema. |
| **Documento** | Um objeto JSON livre (`data`) dentro de uma collection, com id, datas, o cargo que o criou (`createdByRole`) e validade opcional (`expiresInDays` ou `expiresAt`), após a qual é apagado. |
| **Página** | Uma micro-página feita de HTML, publicada num slug no domínio dos links. Global da instância, como os links, e com uma versão do código a cada alteração. |
| **Link** | Um slug curto que redireciona (`302`) para uma URL externa. Global da instância: todo gestor vê e edita todos os links. |
| **Grupo** | Pasta que só organiza a lista de um serviço. Links têm os seus grupos e páginas terão os seus; um grupo não isola nada, não tem token e não é uma aplicação. Excluir um grupo deixa os itens sem grupo. |
| **Slug** | O endereço curto de um link ou página: letras minúsculas, números e hífen. Único na instância inteira, compartilhado entre links e páginas, numa coleção própria com índice único. |

## 5. Módulos e status

### 5.1 Plataforma (pronto)

- Setup inicial que cria o primeiro gestor.
- Login e sessão do gestor (`/auth/*`). Não há cadastro público: o único cadastro aberto é o setup inicial. A senha é guardada com Argon2id; hashes antigos são convertidos no próximo login certo. O login aceita 5 erros por e-mail em 15 min (10 em 1 h, 20 em 24 h) e 20 por IP em 15 min (50 em 1 h, 100 em 24 h); depois responde 429. A sessão vale 7 dias num cookie `HttpOnly; Secure; SameSite=Strict` que o JavaScript do painel não lê, e toda chamada do painel leva o header `X-Pocketrun-Client` contra CSRF. Trocar a senha ou o cargo, ou **Sair de todos os dispositivos** no perfil, encerra as sessões abertas; trocar a própria senha mantém só a sessão atual.
- Usuários (`/users/*`, só superadmin): listar, criar com senha inicial, editar nome, e-mail, cargo e senha, remover. Ninguém muda o próprio cargo nem remove a própria conta, e um usuário com aplicações não pode ser removido.
- Backup (`/backup/*`, só superadmin), na tela **Backup** do grupo Painel: **Exportar** baixa a instância inteira num arquivo `.jsonl.gz` (JSON por linha, compactado): uma linha de cabeçalho com formato, versão, data e quantos documentos cada coleção tem, uma linha por documento em Extended JSON canônico (preserva ObjectId, datas e números) e uma linha final com a contagem exata, que a restauração confere para recusar arquivo cortado. O conteúdo vai sempre (usuários, aplicações e documentos do KV, grupos, slugs, links, páginas com versões, PINs e dados); **Incluir análise e histórico** (ligado de início) junta aberturas, cliques, uso do KV, pedidos das páginas, visitantes únicos e o histórico de alterações. As tentativas de login e de PIN nunca vão. **Restaurar** recebe o arquivo (até 2 GB, compactado ou não), mostra antes a data, o tipo e as contagens lidas do cabeçalho no próprio navegador e pede que se digite `restaurar`. A API grava tudo em coleções temporárias `restore.<nome>` e só no fim troca cada coleção do arquivo de uma vez (`$out`, mantendo os índices); se o arquivo for inválido, estiver cortado ou não tiver nenhum superadmin, nada muda. Só as coleções que estão no arquivo são trocadas, e uma restauração roda por vez. O arquivo tem os hashes das senhas e dos tokens, então deve ficar fora do servidor; para os PINs das páginas e os visitantes únicos continuarem valendo, a instância de destino precisa dos mesmos `JWT_SECRET` e `PAGE_ACCESS_SECRET`.
- Perfil (`/auth/me/*`): cada gestor edita o próprio nome e e-mail e troca a senha informando a atual.
- Painel com menu lateral: o grupo **Início** primeiro, com **Geral**, depois **Serviços**, com KV, Páginas e Links (cada um na cor da sua ferramenta), depois o grupo **Painel** com Usuários, e perfil e saída embaixo. A raiz `/` abre a página Geral, que também é a primeira tela depois de entrar.
- Página **Geral** (`/`): visão de todo o ambiente, com o período escolhido em 24h, 7 dias, 30 dias, 90 dias ou Tudo (guardado no navegador, 7 dias de início) e **Exportar CSV** da série de uso. Números de aplicações do KV (e quantas são de páginas), tokens ativos (e quantos vencem em breve), páginas e links, e acessos no período. O gráfico de linha **Uso dos serviços** mostra juntos os pedidos ao KV, os acessos às páginas e os cliques nos links, cada um na cor da sua ferramenta e com a comparação com o período anterior; vem de `GET /overview/usage/details` (`range`, `tz`). Os pedidos ao KV somam duas fontes: os das rotas públicas `/kv/*` com token, contados por hora e por aplicação na coleção `kvUsage` (400 dias, só as aplicações do gestor), e os das páginas pela ponte `pocketrun.kv` (e pela prévia do editor), lidos do registro de pedidos da aba Dados, que guarda 30 dias. Assim o uso das páginas aparece com o histórico que já existe. Um cartão por serviço com os números principais e o atalho para abrir. Os acessos de páginas e de links no período, com a comparação, o gráfico e os 5 mais acessados. E os **pontos de atenção**: tokens vencidos ou que vencem em até 14 dias, e aplicações abertas a qualquer site, cada um levando à aplicação.
- Aplicações, dentro do KV: criar, listar, ver detalhes, editar, excluir (`/apps/*` na API). A gestão de aplicações fica na página do KV, porque a aplicação é exclusiva dele. A listagem segue o padrão de Páginas e Links, sem grupos: busca, filtro por origem, ordenação, lista ou cards e exclusão. Criar é a tela `/kv/new` e cada aplicação abre em `/kv/{id}/edit`.
- Tokens por aplicação: criar com nome, validade e cargo, trocar o cargo, revogar, ver prefixo e último uso.
- Cargos por aplicação (até 20), na aba **Cargos**: nome com as regras do slug, descrição, regras por collection (ou `*`) com as operações ler, criar, editar e apagar e limite opcional de documentos, e "só os próprios documentos". `admin` é fixo e tem acesso total. Um cargo usado por um token não pode ser apagado; mudar as regras vale na hora.
- Controle de CORS por aplicação e opção de liberar acesso fora do navegador.
- Uma API só, numa porta só: rotas públicas na raiz (tráfego dos clientes) e rotas do painel sob `/admin`, cada grupo com seu CORS.

### 5.2 Dados, antigo PocketDB (pronto)

API pública, autenticada por token da aplicação:

- `GET /ping`, `GET /validate/control-access` (diz também o cargo do token).
- `POST /kv/{collection}/create`, com `expiresInDays` ou `expiresAt`. O nome da collection usa letras, números, `_` e `-` (até 64) e `project` é reservado.
- `GET /kv/{collection}/get-all`, com `page`, `limit` e `pagination`; ordenação por `sortBy` (`createdAt`, `updatedAt`, `expiresAt` ou campo do `data`) e `sortOrder`; recorte por `createdAfter` e `createdBefore`; e qualquer outro query param como filtro sobre `data`, por igualdade ou com os operadores `__gt`, `__gte`, `__lt`, `__lte`, `__ne`, `__contains` (trecho sem diferenciar maiúsculas, com o texto escapado) e `__exists`. Valor entre aspas é sempre texto.
- `GET /kv/{collection}/count` e `POST /kv/{collection}/eval` (`sum`, `avg`, `min`, `max`, `count` e `distinct` de um campo, com os mesmos filtros).
- `GET /kv/{collection}/get/{id}`
- `PATCH /kv/{collection}/update/{id}` junta os campos enviados ao `data`; `PUT /kv/{collection}/replace/{id}` troca o `data` inteiro. Os dois devolvem o documento e aceitam mudar a validade.
- `DELETE /kv/{collection}/delete/{id}`
- `DELETE /kv/{collection}/delete-all`
- `GET /kv/{collection}/export` e `GET /kv/project/export`, em JSON ou CSV (com proteção contra fórmulas).
- `POST /kv/{collection}/import` e `POST /kv/project/import`, até 5.000 itens, aceitando objetos puros ou documentos exportados (mantém criação e validade).
- `DELETE /kv/project/delete-all`
- Toda rota passa pelo cargo do token: ler cobre listar, ler, contar, calcular e exportar a collection; criar cobre gravar e importar; editar cobre `update` e `replace`. Limpar collections e as rotas de projeto ficam só com `admin`. Erro de cargo responde `403 forbidden_operation`.

No painel, por aplicação, em abas como o editor de páginas: **Explorador** de dados (collections e documentos), **Configuração** (nome, descrição, origens permitidas e exclusão da aplicação), **Cargos**, **Tokens** e **Snippets** de código para integrar um cliente. A página **Documentação** (`/kv/docs`, botão no topo do KV) explica a API pública: autenticação, rotas, gravação, filtros, operadores e ordenação, leitura, atualização e exclusão, contagem e cálculos, importação e exportação, validade, cargos, páginas com `pocketrun.kv`, erros e os cuidados com o token no navegador.

Ainda não trazido do PocketDB: upload de arquivos.

### 5.3 Páginas & Links, antigo Shareds (pronto)

Links (pronto):

- Lista global de links com busca, filtro por estado (ativos, desativados, agendados, expirados, esgotados), ordenação (mais recentes, mais acessados, título, perto de expirar), contagem de acessos, cópia da URL pública e exclusão. Mostra em lista ou em cards, num seletor de dois ícones que fica lembrado no navegador. O seletor só aparece no computador: no celular a lista é sempre em cards compactos.
- Uma só página para criar e editar (`/links/new` e `/links/{id}/edit`): título, slug, URL de destino, grupo e ativação. Na edição, abas **Configuração**, **QR code**, **Análise** e **Histórico** (a aba fica na URL, `?tab=`). O "Novo link" aberto de dentro de um grupo já vem com esse grupo escolhido (`/links/new?group={id}`).
- QR code do link curto na aba **QR code**: prévia, tamanho do PNG (256 a 2048 px), correção de erros, margem e fundo transparente, com download em PNG e SVG. O código aponta para o link curto, então os acessos por ele entram na análise.
- Análise geral dos links em `/links/analytics` (botão **Análise** da lista): os mesmos números e gráficos da análise de um link, somando todos os links, mais os links mais acessados do período.
- Histórico de alterações: toda criação, edição e exclusão grava quem alterou (nome e e-mail copiados no momento) e o antes e depois de cada campo. O sistema também assina eventos: fim do período, limite de acessos atingido e saída do grupo quando ele é excluído. O histórico continua depois que o link é excluído.
- Análise de acessos: cada abertura grava data, origem (só o domínio), dispositivo, sistema, navegador e um visitante anônimo (hash de IP e navegador com um sal que troca todo dia; o IP nunca é guardado). Robôs e prévias de link (WhatsApp, Slack e afins) ficam fora dos números. As aberturas são guardadas por 12 meses e somem quando o link é excluído.
- Painel de análise com período (24h, 7, 30, 90 dias ou tudo): cliques, visitantes únicos e média por dia comparados ao período anterior, último clique, progresso do limite ou do período, gráfico de cliques com marcas nas alterações do link, mapa de calor por dia e hora, origens, dispositivos, sistemas, navegadores e exportação em CSV. O contador de acessos que limita o link conta só pessoas: robôs, prévias de link e pedidos `HEAD` redirecionam, mas não gastam o limite.
- Slug personalizado ou id aleatório (botão de sortear). A disponibilidade é verificada sozinha, com um pequeno atraso depois que o gestor para de digitar.
- Ativação: **ativo**, **desativado**, **por período** (fim obrigatório, início opcional) ou **por acessos** (ativo até atingir o limite). No modo por acessos o gestor escolhe como contar: **por clique** (cada abertura conta) ou **por visitante único** (cada pessoa conta uma vez, pela impressão HMAC do IP e do navegador guardada em `uniqueVisitors` por link ou página, sem guardar o IP; quem volta não gasta o limite). O campo `countBy` (`clicks` ou `visitors`) e o contador `uniqueVisitors` ficam no link e na página, a contagem de cliques continua a mesma nos dois modos, e as impressões somem quando o link ou a página é excluído. Fora da regra, o link responde 404 com uma página "Link indisponível" no visual do painel, e o slug continua reservado.
- O destino não pode ser um endereço do próprio encurtador (mesmo host da API), para nenhum link redirecionar para si mesmo.
- Grupos de links com nome, cor e ícone, escolhidos entre oito cores e dezesseis ícones fixos. O botão **Novo grupo** da lista abre a página de criação (`/links/groups/new`). Cada grupo abre na própria página (`/links/groups/{id}`), com as abas **Links** (a lista do grupo, com busca e paginação) e **Configurações** (nome, cor, ícone e exclusão); a aba fica na URL, `?tab=`. Excluir o grupo deixa os links dele sem grupo.
- Redirect público em `GET /{slug}` na raiz da API, com `302`, `Cache-Control: no-store` e contagem atômica de acessos. O slug aceita maiúsculas e barra no final (`/Promo/` abre `promo`), e os parâmetros do endereço vão junto para o destino (`/promo?utm_source=insta`); um parâmetro com o mesmo nome do destino troca o valor dele. O domínio dedicado (roadmap 3.8) fica para depois.

Páginas (pronto):

- Lista global de páginas (`/pages`) com as mesmas regras da lista de links: grupos próprios, busca por título e slug, filtro por estado, ordenação, paginação, lista ou cards, cópia da URL pública, ativar e desativar na hora e exclusão.
- Só HTML, sem CSS e JS separados: o estilo e o script vão dentro do HTML. Limite de 512 KB por página, com um medidor no editor que mostra quanto já foi usado e quanto falta.
- Uma página nova nasce de um modelo e abre no editor. Os modelos são **Em branco** (HTML mínimo) e **CRUD com KV** (uma lista de tarefas que cria, lista, edita, conclui e apaga documentos na coleção `tarefas` com `pocketrun.kv`, sem token; esconde editar e apagar quando o cargo não pode e mostra o que falta configurar quando a página não está ligada ao KV). `/pages/new?template=kvCrud` abre o formulário com o modelo escolhido, e a documentação do KV leva até ele. Na edição, abas **Editor**, **Configuração**, **Versões**, **Acesso**, **Dados**, **QR code**, **Análise** e **Histórico**.
- Editor Monaco com pré-visualização ao lado (no celular, alterna entre código e prévia). A prévia roda num `iframe` isolado, sem acesso ao painel. `Ctrl+S` salva, e o painel avisa ao sair com alterações não salvas. `Shift+Alt+F` (ou o botão de varinha) formata o HTML, e o editor sublinha problemas comuns, como tag aberta sem fechamento, fechamento sem abertura, `</br>` e comentário sem `-->`; o rodapé conta os avisos e leva ao próximo. Tags de fechamento opcional (`p`, `li`, `td`…) não geram aviso.
- Rascunho no navegador: enquanto o HTML tem alterações não salvas, o painel guarda o rascunho (código, mensagem e restauração em andamento) no navegador, por página, cerca de 1 s depois de parar de digitar. Ao reabrir a página com um rascunho diferente do código no ar, um aviso oferece **Recuperar** ou **Descartar**, e alerta se a página ganhou versão nova desde então. Salvar ou descartar apaga o rascunho guardado.
- Versões do código: cada vez que o HTML muda e é salvo, uma versão nova fica guardada, numerada 1.0, 1.1, 1.2 e assim por diante, com quem salvou, quando, o tamanho e uma mensagem opcional de até 80 caracteres ("troquei o telefone"), digitada ao lado do botão de salvar. Ficam guardadas as últimas 50 versões: ao salvar a 51ª, a mais antiga sai, e a versão no ar, que é sempre a mais nova, nunca sai. A aba **Versões** compara (diff) a versão escolhida com a anterior, com qualquer outra versão guardada (sempre da mais antiga para a mais nova) ou com o que está no editor, e restaura uma versão antiga para o editor; ao salvar, ela vira uma versão nova, marcada como restaurada. As versões somem quando a página é excluída.
- Runtime `window.pocketrun`: toda página servida (e a prévia do editor) recebe um script inline no início do `<head>`, injetado na entrega e nunca gravado no HTML. Ele expõe um objeto congelado `{ apiVersion: 1, page: { slug, title, version, updatedAt, isPreview }, access: { isProtected, role }, kv }` e escreve no console a versão da página. `access.role` é o cargo do PIN usado (`""` no PIN geral, `null` sem proteção). Não sobrescreve um `window.pocketrun` que a página já tenha.
- Dados do KV na página (aba **Dados**): o gestor clica em **Ativar dados** e a página ganha uma aplicação do KV só dela (`pageId` na aplicação, Project ID `page-{id da página}`, nome "Página {título}"), sem token e sem origens, com os cargos `leitura` (ler), `escrita` (ler, criar e editar) e `gestao` (também apagar) em `*`. Quem abre sem PIN começa com `leitura`, e o PIN geral e cada PIN da aba Acesso com `escrita`; depois o gestor troca o cargo de cada um (ou "sem acesso aos dados") e edita as regras no KV, onde a aplicação aparece como **Da página** e não pode ser excluída. Desativar mantém os documentos e os cargos, que voltam ao ativar de novo; excluir a página apaga a aplicação e os documentos. Páginas ligadas antes a uma aplicação comum continuam funcionando e são avisadas para desativar e ativar de novo. A página recebe `pocketrun.kv` com `collection(nome)` (`list`, `get`, `count`, `eval`, `create`, `update`, `replace`, `remove` e `can`), `can(collection, operação)`, o cargo e as regras. Nenhum token vai para o HTML: as chamadas vão para `/{slug}/_/kv/...` no domínio das páginas, exigem o header `X-Pocketrun-Page` e a mesma origem (outros sites são recusados), e o servidor tira o cargo do cookie de acesso do PIN, que o JavaScript não lê. Página com PIN e sem sessão responde `401 page_locked`; trocar PIN, encerrar acessos, mudar cargos ou desligar o KV vale no próximo pedido. Pela página só há operações de documento: limpar collections, importar e exportar ficam de fora. Limite de 120 pedidos por minuto por visitante e 1.200 pela página, corpo de até 256 KB. Cada pedido (da página e da prévia) é registrado por 30 dias e aparece na aba Dados com o cargo e o resultado; ligar, mudar e desligar entram no histórico. Na prévia do editor, as chamadas passam por `postMessage` até o painel, que confere a rota e chama a API com a sessão do gestor e o cargo escolhido em **Ver como**. Todas as páginas dividem o mesmo domínio, então o HTML de uma página consegue chamar a ponte de outra com o cookie de quem abriu as duas: por isso a recomendação é usar cargos pequenos por página (o isolamento por subdomínio é o item 9.6 do roadmap).
- Acesso com PIN: a aba **Acesso** protege a página com PINs de 6 números. Há um **PIN geral** opcional e até 20 PINs no total, contando os **cargos**: cada cargo tem um nome com as regras do slug (`gerente`, `caixa-1`) e um PIN próprio, diferente dos outros da página. O PIN é gerado aleatoriamente ou digitado, sem sequências nem números repetidos, e pode ser visto e copiado de novo na lista, com os ícones de ver, copiar e editar: a API confere um HMAC-SHA256 dele e guarda uma cópia cifrada com AES-256-GCM, ambos com chaves derivadas de `PAGE_ACCESS_SECRET`, e cada visualização entra no histórico. PINs criados antes disso precisam ser trocados para aparecer. Com a proteção ligada, o endereço mostra uma tela de PIN e o HTML só sai do servidor depois do PIN certo; o acesso fica num cookie assinado, só daquela página, pela **duração do acesso** escolhida na aba (1 dia por padrão, de 1 hora a 30 dias; diminuir encurta também os acessos já abertos). Trocar o PIN de um cargo encerra os acessos dele; desligar a proteção ou **Encerrar todos os acessos** encerra todos. Erros contam por visitante e página (5 em 15 min, 10 em 1 h, 20 em 24 h) e por página (50 em 1 h fecha a tela de PIN para todos e entra no histórico). Criar o primeiro PIN liga a proteção, e o último PIN não pode ser apagado com ela ligada. O histórico registra as mudanças de acesso e cada abertura com PIN, com o cargo usado. Indicado para conteúdo de equipe, não para dados sensíveis.
- Ativação igual à dos links: ativa, desativada, por período ou por acessos. Fora da regra, a página responde 404 com uma página "Página indisponível", e o slug continua reservado.
- Servida pela mesma rota `GET /{slug}` dos links, com `no-store`. Um trecho solto de HTML ganha um esqueleto com `charset`, `viewport` e o título da página. Com `LINKS_URL` definido, a página só abre nesse domínio, para o HTML do usuário nunca rodar no domínio da API.
- Histórico de alterações igual ao dos links; a troca de código aparece como "Versão do código: 1.2 → 1.3".
- Análise igual à dos links, por página (aba **Análise**) e geral (`/pages/analytics`), sem robôs nem prévias de link. Tempo na página e pings de atividade (roadmap 5.2) ficaram de fora por decisão do dono.

Administração:

- Exportar todas as páginas, links e métricas em JSON e restaurar a partir desse arquivo.

Diferenças em relação ao Shareds que o tornam robusto:

- O acesso é o login do gestor, não um PIN no env do frontend.
- Nenhum token de aplicação vai para um bundle de navegador: o painel usa as rotas `/admin` com o login do gestor.
- Páginas e links são globais da instância e se organizam em grupos por serviço; aplicações ficam só no KV.
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

- Onde páginas e links são servidos: por enquanto na raiz da API pública (`/{slug}`); a direção é um domínio dedicado servido pela mesma API.
- Como importar os dados atuais do Shareds (hoje eles vivem em collections do PocketDB).
- Se o upload de arquivos do PocketDB volta e onde os arquivos ficam guardados.
