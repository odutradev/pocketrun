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
- **1.2** ✅ Feito. Registrar em `.claude/PRODUCT.md` a regra do slug. Decisão já tomada pelo dono: o slug é único na instância inteira e o acesso é sempre `dominio.com/{slug}`, sem prefixo `/p` ou `/l` (ver a regra na seção 3).
- **1.3** ⬜ Definir como importar os dados atuais do Shareds (collections do PocketDB).
- **1.4** ⬜ Definir se o upload de arquivos volta e onde os arquivos ficam guardados (MongoDB GridFS, disco, S3 compatível).

## 2. Documentação e processo

- **2.1** ⬜ Criar a referência da API pública (OpenAPI) com rotas `/kv/*`, `/validate/*` e `/ping`, payloads e códigos de erro.
- **2.2** ✅ Feito. Decisão do dono: o `ui/README.md`, que era o template do Vite, foi removido em vez de substituído. O `README.md` da raiz cobre o painel.
- **2.3** ⬜ Escrever o guia de migração PocketDB → PocketRun (troca de URL e de token, o que muda e o que é compatível).
- **2.4** ⬜ Adotar o fluxo SDD: pasta `.claude/specs/<feature>/` com `requirements.md`, `design.md` e `tasks.md`, e a regra no `CLAUDE.md` de aprovar a spec antes do código.
- **2.5** ⬜ Gerar um SDK em TypeScript da API pública a partir da referência OpenAPI. Depende de 2.1.

## 3. Páginas & Links: API

Depende de 1.1 e 1.2.

**Regra de negócio:** não existe um segundo front nem um serviço separado para páginas e links.

- A mesma API em Go serve tudo. Páginas e links são um grupo de rotas próprio no código, ao lado das rotas públicas e das rotas `/admin`.
- Páginas e links ficam num domínio só deles (ex: `s.pocketrun.com`), configurado por variável de ambiente. Esse domínio aponta para o mesmo container `api`, e a API escolhe o grupo de rotas pelo host da requisição.
- O domínio próprio é obrigatório por segurança. As páginas executam HTML e JS escritos pelo usuário, e no mesmo domínio do painel ou da API esse JS teria acesso à sessão do gestor.
- A API entrega o HTML da página já montado, com cache e headers de segurança (CSP). O redirect é uma resposta `302` do servidor, nunca feito em JavaScript no navegador, para ser instantâneo e funcionar com robôs e prévias de link.
- Como todas as aplicações compartilham o mesmo domínio, o slug tem que ser único na instância inteira (resposta do 1.2).

**Regra do slug:**

- O acesso é sempre `dominio.com/{slug}`, sem prefixo de tipo (`/p`, `/l`) nem de aplicação.
- Páginas e links dividem o mesmo espaço de slugs: se existe a página `promo`, nenhum link pode se chamar `promo`, e o contrário também.
- Uma coleção única de slugs, com índice único, aponta para a página ou o link. Cada acesso faz uma só busca e já sabe se devolve HTML ou redireciona.
- O slug aceita só letras minúsculas, números e hífen.
- Nomes que o navegador e os robôs pedem na raiz de qualquer domínio ficam reservados: `favicon.ico`, `robots.txt`, `healthz` e afins.
- Rotas internas do domínio (ex: o ping de analytics do 5.2) usam o prefixo `/_/`, que nenhum slug pode ter.
- O CSS e o JS da página vão embutidos no HTML entregue, sem rota própria para arquivos.

- **3.1** ✅ Feito. Criar o domínio de páginas: modelo e repositório, na coleção única de slugs compartilhada com os links. Decisões do dono: páginas são globais da instância (como os links), têm só HTML (sem CSS e JS separados) com limite de 512 KB, a mesma ativação dos links (ativo, desativado, por período, por acessos) e uma versão do código a cada alteração do HTML (1.0, 1.1, 1.2…).
- **3.2** ✅ Feito. Criar o domínio de links: modelo (slug, URL de destino, ativo, datas) e repositório, registrando o slug na coleção única de slugs. Decisão do dono: links são globais da instância (não pertencem a aplicações) e se organizam em grupos de links.
- **3.3** ✅ Feito. Rotas admin de páginas: listar, criar, ver, editar, excluir, ativar e desativar (`PATCH /admin/pages/{id}/status/set`), histórico, versões (`/versions/list` e `/versions/{number}/details`), análise e grupos de páginas.
- **3.4** ✅ Feito. Rotas admin de links: listar, criar, ver, editar, excluir, ativar e desativar.
- **3.5** ✅ Feito. Geração de slug aleatório e validação de slug personalizado: formato (minúsculas, números e hífen), nomes reservados da raiz e unicidade entre páginas e links da instância inteira.
- **3.6** ✅ Feito. Rota `/{slug}`: busca o slug na coleção única e, se for página, entrega o HTML (num esqueleto com `charset`, `viewport` e título quando o HTML é um trecho solto), com `no-store` e headers de segurança. Com `LINKS_URL` definido, a página só abre nesse domínio; fora dele responde "Página indisponível".
- **3.7** ✅ Feito. Na mesma rota `/{slug}`, se o slug for link, responde `302` para a URL de destino. Por enquanto na raiz da API pública, até o 3.8.
- **3.8** ✅ Feito. Decisões do dono: com `LINKS_URL` definido, links e páginas só respondem nesse domínio (no domínio da API, `/{slug}` responde `404` com a tela de não encontrado) e a raiz `/` dos dois domínios mostra essa mesma tela. No domínio de links, os caminhos que não são de slug (`/kv`, `/admin`) seguem para a API, para o desenvolvimento local funcionar com `LINKS_URL` igual à URL da API. Pedido original: roteamento por host na API: variável de ambiente com o domínio de páginas e links (em `.env.example` e no compose), grupo de rotas servido só nesse domínio, decisão do que a raiz `/` mostra (404 ou redirect para um site configurado) e o passo a passo do domínio extra no Dokploy no `README.md`. Os links já funcionam sem ele: o redirect responde na raiz da API pública (ver 3.7), e o link curto fica no domínio da API.

## 4. Páginas & Links: painel

Depende dos itens da seção 3 correspondentes.

O painel de links já tem mais do que os itens abaixo: grupos com nome, cor e ícone, histórico de alterações, análise de acessos, busca e paginação. A descrição completa fica em `.claude/PRODUCT.md`, seção 5.3.

- **4.1** ✅ Feito. Listagem com status e ações. Como links e páginas são globais da instância, não fica nos detalhes da aplicação: a de links é `/links` e a de páginas é `/pages`, com grupos, busca, filtro, ordenação e paginação.
- **4.2** ✅ Feito. Editor de página com Monaco (só HTML, decisão do dono), pré-visualização ao lado, medidor do tamanho com quanto falta para o limite, e aba Versões com comparação (diff) e restauração.
- **4.3** ✅ Feito. Formulário de criação e edição de link.
- **4.4** ✅ Feito. Ativar e desativar página ou link direto da listagem (`PATCH /admin/links/{id}/status/set`, como nas páginas), e copiar a URL pública.

## 5. Analytics

Depende de 3.6 e 3.7.

- **5.1** ✅ Feito. Registrar visualização a cada acesso de página e de link. Feito para links e páginas; cada abertura grava data, origem, dispositivo, sistema, navegador e um visitante anônimo, fora robôs e prévias de link, e fica guardada por 12 meses.
- **5.2** ⬜ Script de ping de atividade injetado nas páginas publicadas, e rota pública que recebe os pings.
- **5.3** ✅ Feito. Rotas admin de métricas: visualizações por dia (14 dias), tempo médio e total, total de pings, por item e por aplicação. Feito por link e por página (`/analytics/details`, com períodos de 24h a tudo). Decisão do dono: a análise das páginas é igual à dos links, então tempo e pings ficam de fora (ver 5.2), e "por aplicação" não se aplica, porque links e páginas são globais.
- **5.4** ✅ Feito. Dashboard no painel com gráfico de área dos últimos 14 dias. Feito em `/links/analytics` e `/pages/analytics`, com os acessos de todos os itens juntos (períodos de 24h a tudo), os mais acessados, origens, horários e dispositivos.
- **5.5** ✅ Feito. Métricas por página e por link na tela de detalhes do item. Feito na aba Análise do link e da página (cliques, visitantes, comparação com o período anterior, gráfico, mapa de calor, origens, dispositivos, sistemas, navegadores e exportação em CSV).

## 6. Backup e migração

- **6.1** ✅ Feito. Exportar páginas, links e métricas em JSON. Decisão: como links e páginas são globais, o backup é da instância inteira, não de uma aplicação, e só o superadmin faz. `GET /admin/backup/export` gera um `.jsonl.gz` (cabeçalho, um documento por linha em Extended JSON canônico e uma linha final com as contagens), com análise e histórico opcionais (`scope=full|content`). As tentativas de login e de PIN ficam de fora. Tela **Backup** no painel.
- **6.2** ✅ Feito. Restaurar a partir do arquivo exportado (`POST /admin/backup/restore`). Decisões: troca só as coleções que estão no arquivo; grava primeiro em coleções temporárias e só troca tudo no fim, então um arquivo inválido, cortado ou sem superadmin não muda nada; uma restauração por vez; o painel mostra a prévia do cabeçalho e pede que se digite `restaurar`.
- **6.3** ⬜ Importar os dados do Shareds para Páginas & Links. Depende de 1.3 e da seção 3.

## 7. Dados (ex-PocketDB)

- **7.1** ⬜ Upload de arquivos por aplicação, com limite de tamanho e listagem no painel. Depende de 1.4.

## 8. Qualidade

- **8.1** ⬜ Testes automatizados de isolamento: garantir que o token de uma aplicação nunca lê nem escreve dados, páginas ou links de outra.
- **8.2** ⬜ Workflow de CI que roda `go vet`, `go test`, lint e build do painel a cada push, antes do `docker-publish.yml` publicar a imagem. Hoje o CI só publica, sem validar.
- **8.3** ⬜ Testes das regras de negócio da API: cargos do KV (operações, limite de documentos, "só os próprios"), ativação por período e por acessos, contagem por clique e por visitante único, limites da ponte `pocketrun.kv` e do login. Hoje a API tem um teste só (`api/internal/domains/user/utils/passwordhash/passwordhash_test.go`).
- **8.4** ⬜ Testes do painel: funções de `utils/functions` e os fluxos principais (login, criar aplicação, editor de página). Hoje o painel não tem nenhum teste.

## 9. Dados nas páginas e cargos do KV

Pedido pelo dono em 20/11/2026: trazer tudo o que o KV v1 tinha, cargos no KV e o KV ligado às páginas com `window.pocketrun`, sem token no HTML.

- **9.1** ✅ Feito. Recursos do KV v1: `count`, `eval` (`sum`, `avg`, `min`, `max`, `count`, `distinct`), `export` e `import` de collection e de projeto (JSON e CSV), ordenação (`sortBy`, `sortOrder`), recorte por `createdAfter` e `createdBefore` e busca parcial (`__contains`). Corrigidos os problemas do v1: `update` junta os campos (e `replace` troca tudo), `eval` usa o `data` nos filtros e no campo, a importação respeita a validade, a busca parcial escapa o texto e tem limite, valores entre aspas ficam texto, índices compostos por collection e criação, e `project` é reservado como nome de collection.
- **9.2** ✅ Feito. Cargos nas aplicações do KV: regras por collection (ou `*`) com ler, criar, editar e apagar, limite de documentos, "só os próprios documentos" e `admin` fixo; cargo em cada token (os antigos viram `admin`) e conferência em toda rota pública.
- **9.3** ✅ Feito. Aba **Cargos** no editor da aplicação, cargo ao gerar token e troca de cargo na aba Tokens.
- **9.4** ✅ Feito. Vínculo de uma aplicação do KV com a página (aba **Dados**): cargo de quem abre sem PIN e um por PIN, histórico, registro dos pedidos por 30 dias e limpeza junto com a página.
- **9.5** ✅ Feito. Ponte `/{slug}/_/kv/...` no domínio das páginas e `pocketrun.kv` no runtime, com o cargo vindo do cookie do PIN, mesma origem obrigatória, limite por visitante e por página, prévia do editor por `postMessage` com **Ver como**, e o modelo CRUD com KV sem token.
- **9.6** ⬜ Isolar cada página num subdomínio próprio (`{slug}.dominio`), para o HTML de uma página não conseguir chamar a ponte nem ler o HTML de outra. Precisa de DNS e certificado coringa no deploy.

## 10. Escala

Da análise do projeto feita em 20/11/2026: pontos que funcionam hoje, mas pesam com o crescimento do tráfego.

- **10.1** ⬜ Agregar no MongoDB o uso da página Geral. Hoje `Moments` traz para a memória o horário de cada acesso de páginas, de links e de pedidos da ponte, e o Go conta um por um; no período "Tudo", com 12 meses de acessos, fica lento e gasta RAM. Trocar por `$group` por hora ou dia (ou por contadores por hora, como o `kvUsage`).
- **10.2** ⬜ Juntar as contagens do `kvUsage` em memória e gravar em lote a cada poucos segundos, em vez de uma goroutine e uma escrita por pedido em `UsageService.Record`.
- **10.3** ⬜ Guardar os contadores de limite (login, ponte `pocketrun.kv`) num lugar compartilhado (MongoDB ou Redis). Hoje ficam na memória do processo, e com mais de uma réplica da API cada uma conta sozinha.

## 11. Novos recursos

Da análise do projeto feita em 20/11/2026.

- **11.1** ⬜ Webhooks por aplicação do KV: avisar uma URL quando um documento for criado, editado ou apagado, com assinatura HMAC, novas tentativas e registro das entregas.
- **11.2** ⬜ Notificações dos pontos de atenção: avisar no painel (e por e-mail, se configurado) quando um token vence em breve, um link ou página expira ou atinge o limite de acessos. Hoje eles só aparecem na Geral.
- **11.3** ⬜ QR code e parâmetros UTM nos links: gerar e baixar o QR code do link curto e montar a URL de destino com `utm_*` no formulário.
- **11.4** ⬜ Templates de página prontos (formulário de contato, lista de espera, enquete) que já usam o `pocketrun.kv` e criam a aplicação da página com os cargos certos.
- **11.5** ⬜ Log de auditoria da instância: uma tela com quem mudou o quê em usuários, aplicações, tokens, cargos, páginas e links, com filtro por gestor e por período. Hoje só existe o histórico de cada item.

## Ordem sugerida

Da análise de 20/11/2026. É só sugestão: cada item continua dependendo do pedido do dono pelo número.

1. Segurança e confiabilidade: 8.1, 8.2, 9.6, 3.8, 6.1 e 6.2, 8.3.
2. Escala: 10.1, 10.2, 10.3.
3. Produto: 5.2, 1.4 e 7.1, 11.1, 11.2, 11.3, 11.4, 4.4, 11.5.
4. Documentação: 2.1, 2.5, 2.2, 2.3, 8.4.
