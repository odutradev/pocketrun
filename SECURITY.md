# Segurança

## Versões com suporte

Só a versão mais recente recebe correções de segurança. Antes de reportar, atualize para as imagens mais recentes (`odutradev/pocketrun-api:latest` e `odutradev/pocketrun-ui:latest`) e veja no [histórico de versões](CHANGELOG.md) o que mudou.

## Como reportar uma vulnerabilidade

Não reporte falhas de segurança em chamados públicos nem em propostas de alteração abertas no repositório.

1. No GitHub, abra a aba de segurança do repositório.
2. Use a opção de reportar uma vulnerabilidade.
3. Conte:
   - o que a falha permite fazer e quem é afetado (gestor, token de aplicação, visitante de página ou de link);
   - os passos para reproduzir, com a requisição ou a página usada;
   - a versão do PocketRun e como ele está hospedado.

O relato fica privado entre você e o mantenedor. A resposta chega pelo próprio GitHub, e a correção sai numa versão nova, registrada no histórico de versões. Se quiser, seu nome entra nos créditos.

## O que conta como vulnerabilidade

Entram, por exemplo:

- acesso aos dados de outra aplicação pelo KV ou pela ponte das páginas;
- uso do painel sem login, ou das rotas `/admin` com um token de aplicação;
- página com PIN aberta sem o PIN, ou o HTML de uma página rodando no domínio da API;
- um cargo que faz mais do que deveria, como um cargo de leitura que consegue gravar.

Não entram:

- falhas que exigem acesso ao servidor, ao banco de dados ou às variáveis de ambiente da instância;
- o conteúdo que o próprio gestor publica nas páginas;
- a força do PIN de 6 números, feito para conteúdo de equipe e não para dados sensíveis;
- limites de requisições contornados com muitos endereços IP diferentes.

## Para quem hospeda

- Gere `JWT_SECRET` e `PAGE_ACCESS_SECRET` com `openssl rand -hex 32` e guarde os dois fora do repositório.
- Use HTTPS nos três domínios: painel, API e links.
- `ADMIN_CORS_ALLOWED_ORIGINS` deve ser exatamente o endereço do painel.
- O arquivo de backup do painel tem os hashes das senhas e dos tokens. Guarde-o fora do servidor.
