# Histórico de versões

Tudo o que muda entre as versões do PocketRun. Leia antes de atualizar uma instância própria: a seção **Ação necessária** lista o que você precisa mudar no deploy.

As versões seguem o `version` do `package.json`, e cada uma vira as imagens `odutradev/pocketrun-api` e `odutradev/pocketrun-ui` no Docker Hub.

## Não publicado

### Ação necessária

- **O `docker-compose.yml` do repositório sobe o próprio MongoDB** (serviço `mongo`, dados no volume `mongo-data`) e fixa `MONGODB_URI=mongodb://mongo:27017` na API, que só inicia depois que o banco responde. Quem fazia deploy desse compose com um banco externo passa a usar o banco novo, vazio: restaure um backup do painel ou use o compose com MongoDB externo do README.

## 1.8.0 (2026-11-24)

- As imagens no Docker Hub também ganham a tag com o número da versão, como `odutradev/pocketrun-api:1.8.0`, para fixar uma versão no deploy em vez de usar `latest`.

## 1.7.9 (2026-11-24)

### Ação necessária

- **Todas as variáveis de ambiente passam a ser obrigatórias.** A API não inicia se faltar uma delas ou se o valor for inválido, e o log diz qual corrigir. Confira `HOST`, `PORT`, `CORS_ALLOWED_ORIGINS`, `ADMIN_CORS_ALLOWED_ORIGINS`, `MONGODB_URI`, `MONGODB_NAME`, `JWT_SECRET`, `PAGE_ACCESS_SECRET`, `LINKS_URL` e `ALLOW_HTTP`.
- **`JWT_SECRET` e `PAGE_ACCESS_SECRET` precisam de 32 caracteres ou mais e não podem ser iguais.** Gere com `openssl rand -hex 32`. Trocar o `JWT_SECRET` encerra as sessões do painel e zera a contagem de visitantes únicos. Trocar o `PAGE_ACCESS_SECRET` invalida os PINs das páginas.
- **Sem `PAGE_ACCESS_SECRET`, a API não deriva mais a chave dos PINs do `JWT_SECRET`.** Se a sua instância rodava sem ele, defina `PAGE_ACCESS_SECRET=page-access:` seguido do seu `JWT_SECRET` para manter os PINs atuais.
- **`LINKS_URL` é obrigatório.** Links e páginas só abrem nesse domínio.
- **O painel lê `API_URL` e `LINKS_URL` quando o container sobe.** Passe as duas no serviço `ui` do compose. `VITE_API_URL` deixa de valer no deploy.
- **Nova variável obrigatória `ALLOW_HTTP`** (`true` ou `false`). Use `false` com HTTPS. Use `true` só num domínio sem HTTPS, como os `*.traefik.me` do Dokploy, onde o login do painel falhava.
- **O compose não fixa mais `dns: 8.8.8.8 / 1.1.1.1`.** Se o container da API não resolver um endereço `mongodb+srv://`, adicione `dns:` no seu compose.

### Novidades

- O login do painel pode funcionar em HTTP com `ALLOW_HTTP=true`, para domínios que ainda não têm HTTPS.
- A mesma imagem do painel serve para qualquer domínio, sem compilar de novo.
- As imagens da API e do painel verificam a própria saúde (`HEALTHCHECK`). O painel só sobe depois que a API responde, e a API ganhou o comando `api healthcheck` para isso.
- Exemplos de compose com MongoDB no mesmo servidor (dados num volume e verificação de saúde) e com MongoDB externo, e o arquivo `.env.selfhost.example` para hospedar a sua instância.
- Licença ISC (`LICENSE`), política de segurança (`SECURITY.md`) e este histórico de versões (`CHANGELOG.md`).

## 1.7.8 (2026-11-24)

### Novidades

- Logs em texto colorido no lugar de JSON
- Rota para ligar e desligar um link
- Ligar e desligar links direto da lista
- Links e páginas só abrem no domínio de links

## 1.7.7 (2026-11-24)

Só manutenção, documentação e ajustes internos.

## 1.7.6 (2026-11-24)

Só manutenção, documentação e ajustes internos.

## 1.7.5 (2026-11-24)

### Correções

- Remoção de índices antigos de aplicações que impediam criar dados no KV

## 1.7.4 (2026-11-20)

### Correções

- O CI passa o contexto do projeto para a imagem do painel

## 1.7.3 (2026-11-20)

Só manutenção, documentação e ajustes internos.

## 1.7.2 (2026-11-20)

### Novidades

- A Documentação mostra o link público do llms.txt

### Correções

- O painel serve arquivos de texto em UTF-8
- O servidor de desenvolvimento serve arquivos de texto em UTF-8

## 1.7.1 (2026-11-20)

### Novidades

- Exportação e restauração do backup da instância na API
- Suporte ao backup no painel
- Tela de Backup para exportar e restaurar a instância
- A Documentação virou uma página própria no menu

## 1.7.0 (2026-11-20)

### Correções

- O uso da Geral conta os pedidos ao KV feitos pelas páginas

## 1.6.9 (2026-11-20)

### Novidades

- Contagem de pedidos ao KV por hora e uso geral da instância
- Período, exportação em CSV e gráfico de uso dos serviços na Geral
- O limite de acessos pode contar visitantes únicos no lugar de cliques
- Escolha entre cliques e visitantes únicos na ativação por limite

## 1.6.8 (2026-11-20)

### Novidades

- Página Geral como início do painel

## 1.6.7 (2026-11-20)

### Novidades

- Aplicações do KV que pertencem a uma página, com cargos base
- Ativar dados numa página cria uma aplicação do KV só dela
- Aplicações de página marcadas e protegidas contra exclusão
- Dados da página ativados com um clique, sem escolher aplicação

## 1.6.6 (2026-11-20)

### Novidades

- Rotas de contagem, agregação, importação e exportação no KV
- Cargos com permissões por collection nas aplicações do KV
- Aba de cargos do KV e cargo por token no painel
- Páginas acessam o KV por uma ponte na mesma origem
- Aba Dados e ponte do KV na prévia do editor de páginas

### Correções

- O histórico da página registra os cargos do KV em texto

## 1.6.5 (2026-11-18)

### Novidades

- Modelo de página com CRUD no KV
- Documentação do KV no painel

## 1.6.4 (2026-11-18)

### Novidades

- Filtros, ordenação e abas no editor de aplicações
- Lista do KV no mesmo formato das listas de páginas e links
- Página da aplicação virou um editor com abas

## 1.6.3 (2026-11-18)

### Novidades

- As páginas publicadas recebem o window.pocketrun
- O window.pocketrun também funciona na prévia do editor

## 1.6.2 (2026-11-18)

### Novidades

- Login do painel com Argon2id, limite de tentativas e cookie de sessão
- Sessão por cookie no painel e opção de sair de todos os dispositivos

## 1.6.1 (2026-11-18)

### Correções

- Fim do aviso de exibição única ao criar um PIN

## 1.6.0 (2026-11-18)

### Novidades

- PINs das páginas guardados cifrados, para poderem ser vistos de novo
- Ver, copiar e editar PINs das páginas

## 1.5.9 (2026-11-18)

### Novidades

- Cada página define quanto tempo dura o acesso com PIN
- Seletor da duração do acesso na aba Acesso

## 1.5.8 (2026-11-18)

### Novidades

- Campo de PIN com seis dígitos
- Digitar ou gerar o PIN na janela de acesso
- Tela de PIN da página protegida com seis caixas

## 1.5.7 (2026-11-18)

### Correções

- Rota do estado de acesso da página separada das rotas de grupos

## 1.5.6 (2026-11-18)

### Novidades

- Proteção de páginas por PIN, com cargos
- A página protegida pede o PIN antes de mostrar o conteúdo
- Aba Acesso para gerenciar PINs e cargos

## 1.5.5 (2026-11-18)

### Novidades

- Mensagem por versão e as últimas 50 versões guardadas
- Mensagem por versão e comparação entre quaisquer duas versões
- Rascunhos não salvos guardados no navegador, com opção de recuperar
- Formatação e verificação do HTML no editor

## 1.5.4 (2026-11-18)

### Novidades

- Filtro e ordenação no navegador quando a lista de links cabe numa página
- Serviço de páginas com versões, histórico e análise
- Suporte às páginas no painel
- Painel de páginas com editor, versões e comparação
- Modos de visualização, tela cheia e comparação legível no editor de páginas

### Correções

- A busca de links espera mais antes de pesquisar

## 1.5.3 (2026-11-18)

### Novidades

- URL pública dos links lida das variáveis de ambiente
- Links curtos montados com a URL pública dos links

## 1.5.2 (2026-11-18)

### Novidades

- Redirecionamentos mais seguros, filtros na lista e visão geral de links
- Filtro por estado e ordenação na lista de links
- Aba de QR code e grupo já escolhido no editor de links
- Página de análise geral dos links

## 1.5.1 (2026-11-18)

### Novidades

- Cor e ícone nos grupos
- Escolha de cor e ícone dos grupos no painel
- Grupos com página e configurações próprias, no lugar da janela

## 1.5.0 (2026-11-18)

### Novidades

- Caminho das páginas pai no título
- Título com caminho dentro de um grupo de links
- Total da lista antes da busca de links
- Indicador de carregamento no lugar do ícone da busca
- Indicador da busca visível por pelo menos 500 ms
- Limpar a busca volta para a lista já carregada
- Página atual do caminho destacada com a cor de destaque
- Caminho de links e grupo no editor de links

### Correções

- Total de links entre a busca e a troca de visualização

## 1.4.9 (2026-11-18)

### Novidades

- Cards de grupos e links sem grupo na página de links
- Barra de ferramentas entre os grupos e os links
- Busca, paginação e totais por grupo na API de links
- Campo de busca que espera o fim da digitação
- Lista de links paginada e pesquisada pela API
- Busca no navegador quando a lista de links cabe numa página

## 1.4.8 (2026-11-17)

### Novidades

- Abrir o link curto pelo slug na lista

## 1.4.7 (2026-11-17)

### Novidades

- Transições suaves entre páginas do histórico de links
- A API escuta só em localhost no desenvolvimento local

## 1.4.6 (2026-11-17)

### Novidades

- Excluir link pelo editor
- O riscado some ao passar o mouse nas mudanças do histórico
- O histórico de links devolve o total
- Histórico de links paginado, com o total ao lado dos filtros
- Marcas de definido e removido para valores vazios no histórico
- Paginação do histórico centralizada

## 1.4.5 (2026-11-17)

### Novidades

- Abas do editor de links na largura toda
- Título do link limitado a 20 caracteres
- O editor abre depois de criar ou salvar um link

## 1.4.4 (2026-11-17)

### Novidades

- Botões só com ícone

### Correções

- Cabeçalho das páginas numa linha só no celular
- Animação do logo no celular depois de fechar o menu
- Troca de visualização dos links só no computador

## 1.4.3 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.4.2 (2026-11-17)

### Novidades

- Rotas de histórico de mudanças e de análise de acessos dos links
- Seletores só com ícone e rótulos escondidos
- Tabela de links mais simples e troca entre lista e cards
- Suporte ao histórico e à análise de links no painel
- Editor de links com abas de configurações, análise e histórico
- Linha do tempo das mudanças do link
- Painel de análise dos links com gráficos
- Linhas das tabelas viram cards no celular
- Lista de links compacta no celular

### Correções

- Formulários de janelas não enviam mais o formulário da página
- Formulário e análise de links cabem na largura do celular

## 1.4.1 (2026-11-17)

### Novidades

- Item de ação na lista de seleção
- Novo grupo dentro da lista de grupos
- Slug obrigatório e destino do link validado
- O controle deslizante acompanha valores digitados acima do máximo
- O controle deslizante anima até o valor digitado
- Botão de copiar a URL pública do link

### Correções

- Limite mínimo de cliques igual a um
- Período personalizado só exige a data de fim

## 1.4.0 (2026-11-17)

### Novidades

- Campo com controle deslizante e valor exato
- Períodos prontos e limite de cliques no formulário de links
- Slug começa vazio e é gerado ao salvar
- Lista de seleção no tema do painel
- Seletor de protocolo no destino do link
- Criar grupos pelo formulário do link

## 1.3.9 (2026-11-17)

### Correções

- Formulários de link e de segurança na largura toda

## 1.3.8 (2026-11-17)

### Novidades

- Cabeçalho padrão das páginas
- Cabeçalho padrão nas páginas dos serviços
- Carregamento com o logo no centro do conteúdo
- Registro único de slugs para links e páginas
- Grupos para links e páginas
- Serviço de links com período e limite de cliques
- Rotas de links no painel e redirecionamento público
- Serviços antes do Painel no menu lateral
- Campos com conteúdo no fim e ações extras no cabeçalho
- Suporte aos links no painel
- Lista de links com grupos
- Mesma tela para criar e editar links
- Links marcados como disponíveis na identidade visual
- Variação de botão na ação do cabeçalho
- Cabeçalho padrão em usuários, perfil e detalhes da aplicação

## 1.3.7 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.3.6 (2026-11-17)

### Correções

- Perfil ocupa a área toda da página

## 1.3.5 (2026-11-17)

### Novidades

- Contagem de aplicações por gestor
- Rotas de usuários e de perfil na API
- Suporte à gestão de usuários no painel
- Menu lateral no lugar da barra superior
- Páginas de usuários e de perfil
- Grupo Serviços no menu lateral
- Páginas dos serviços KV, Páginas e Links
- Transições e efeitos de passar o mouse no símbolo da marca
- Animação do logo do menu ao trocar de serviço
- Indicador do estado da API com endereço e versão
- Estado da API ao lado do logo do menu

### Correções

- A animação de entrada do símbolo não recomeça ao mudar de pose

## 1.3.4 (2026-11-17)

### Novidades

- Fim do cadastro na tela de login

## 1.3.3 (2026-11-17)

### Novidades

- Comando para apagar o banco local, com superadmin opcional
- O setup leva ao login quando já existe um gestor
- O estado do setup é conferido de novo depois de uma falha

## 1.3.2 (2026-11-17)

### Correções

- Símbolo da marca como ícone do site
- PocketRun como título da aba em todas as páginas

## 1.3.1 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.3.0 (2026-11-17)

### Correções

- Portas publicadas só localmente, para não disputar portas no servidor

## 1.2.9 (2026-11-17)

### Novidades

- Painel redesenhado com os componentes da identidade visual

## 1.2.8 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.2.7 (2026-11-17)

### Novidades

- Símbolo da marca com todas as variações
- Seção de movimento na página de identidade visual

## 1.2.6 (2026-11-17)

### Correções

- Tom dourado no "RUN" do logo claro

## 1.2.5 (2026-11-17)

### Novidades

- Cores, dados e geradores de arquivos da marca
- Componentes do símbolo e do logo
- Página de identidade visual em /id

## 1.2.4 (2026-11-16)

Só manutenção, documentação e ajustes internos.

## 1.2.3 (2026-11-16)

Só manutenção, documentação e ajustes internos.

## 1.2.2 (2026-11-16)

Só manutenção, documentação e ajustes internos.

## 1.2.1 (2026-10-27)

Só manutenção, documentação e ajustes internos.

## 1.2.0 (2026-10-27)

Só manutenção, documentação e ajustes internos.

## 1.1.9 (2026-10-27)

### Novidades

- Armazenamento de usuários na API

## 1.1.8 (2026-10-27)

Só manutenção, documentação e ajustes internos.

## 1.1.7 (2026-10-27)

### Novidades

- Rotas do painel separadas das rotas públicas
- Servidores separados para as rotas públicas e do painel
- Docker e painel usam as rotas separadas do painel
- Rotas de saúde e de setup reorganizadas
- Rotas de usuários, aplicações e KV reorganizadas
- Preferências locais e tema claro ou escuro guardados no navegador
- Paleta verde-azulada e aparência ligada às preferências
- Tema verde-menta nos componentes e botão de modo escuro

## 1.1.6 (2026-10-20)

Só manutenção, documentação e ajustes internos.

## 1.1.5 (2026-10-15)

### Correções

- package-lock sincronizado para o build do Docker

## 1.1.4 (2026-10-15)

Só manutenção, documentação e ajustes internos.

## 1.1.3 (2026-10-15)

### Novidades

- Script de desenvolvimento que sobe a API e o painel juntos
- Radix UI Themes instalado e configurado
- Barra, login e setup migrados para o Radix UI
- Início e janelas de aplicação e token migrados para o Radix UI
- Detalhes da aplicação e explorador de dados migrados para o Radix UI
- Cliente HTTP único e tipos globais no painel
- Chamadas à API e tipos dos contratos no painel
- Estado global de login, avisos e navegação
- Componentes base, layout e formulários do painel
- Páginas de login, setup e início
- Rotas do painel com proteção por login

## 1.1.2 (2026-10-15)

### Novidades

- Rotas do setup inicial do superadmin
- Assistente de setup do superadmin no painel
- Setup integrado às rotas e ao login

## 1.1.1 (2026-10-15)

### Correções

- Portas internas no compose, para o Dokploy não disputar portas

## 1.1.0 (2026-10-15)

### Correções

- Porta padrão 5002, para não disputar a 5000

## 1.0.9 (2026-10-15)

### Novidades

- Portas alinhadas ao compose de referência (80 e 5000)

## 1.0.8 (2026-10-15)

### Correções

- API_PORT e porta do painel sem disputar a 3000

## 1.0.7 (2026-10-15)

Só manutenção, documentação e ajustes internos.

## 1.0.6 (2026-10-15)

### Novidades

- JWT_SECRET no compose e na documentação

## 1.0.5 (2026-10-15)

Só manutenção, documentação e ajustes internos.

## 1.0.4 (2026-09-23)

### Correções

- Erros de compilação nas rotas de aplicações e do KV

## 1.0.3 (2026-09-23)

### Novidades

- Login do gestor, gestão de aplicações e novo controle de CORS

## 1.0.2 (2026-09-23)

### Correções

- go mod tidy no build da imagem da API

## 1.0.1 (2026-09-23)

### Novidades

- Primeira versão
- Estrutura base da API com rotas, CORS, variáveis de ambiente e ping
- API organizada por domínio e rota de saúde
- Remoção de um teste desnecessário no início
- Dockerfile, compose e README para o Dokploy
- Estrutura base do painel com React, Vite e TypeScript
- Painel no compose e documentação atualizada
- Publicação das imagens no Docker Hub pelo GitHub Actions
- Compose e README com suporte ao Dokploy e à Hostinger
- API conectada ao MongoDB, com log de sucesso
- MongoDB local ou remoto pela URI, com documentação

### Correções

- Arquivo .env de exemplo
- Erro na leitura do .env tratado e testes do ping
- Porta padrão do painel 3001, para não disputar portas
- Portas internas no compose do Dokploy, para não disputar portas
- Verificação de saúde aceita a resposta de sucesso
- Fim das portas fixas no servidor, para não disputar portas no Dokploy
