# Segurança

## Versões com suporte

Só a versão mais recente recebe correções de segurança. Atualize para a última imagem (`odutradev/pocketrun-api:latest` e `odutradev/pocketrun-ui:latest`) antes de reportar, e leia o [CHANGELOG](CHANGELOG.md) para ver o que muda.

## Como reportar uma vulnerabilidade

Não abra uma issue pública nem um pull request para falhas de segurança.

1. Abra a aba **Security** do repositório no GitHub.
2. Clique em **Report a vulnerability**.
3. Descreva:
   - o que a falha permite fazer e quem é afetado (gestor, token de aplicação, visitante de página ou link);
   - os passos para reproduzir, com a requisição ou a página usada;
   - a versão do PocketRun e como ele está hospedado.

O relato fica privado entre você e o mantenedor. Você recebe uma resposta pelo próprio GitHub, e a correção sai numa versão nova, citada no CHANGELOG. Se quiser, seu nome entra nos créditos.

## Escopo

Entram, por exemplo:

- acesso a dados de outra aplicação pelo KV ou pela ponte das páginas;
- uso do painel sem login, ou de rotas `/admin` com um token de aplicação;
- página com PIN aberta sem o PIN, ou HTML de página rodando no domínio da API;
- escalada de cargo, como um cargo de leitura que consegue gravar.

Não entram:

- falhas que dependem de acesso ao servidor, ao banco ou ao `.env` da instância;
- o conteúdo que o próprio gestor publica nas páginas;
- a força do PIN de 6 números. Ele foi feito para conteúdo de equipe, não para dados sensíveis;
- limites de requisições contornados com muitos IPs diferentes.

## Para quem hospeda

- Gere `JWT_SECRET` e `PAGE_ACCESS_SECRET` com `openssl rand -hex 32` e guarde os dois fora do repositório.
- Use HTTPS nos três domínios: painel, API e links.
- `ADMIN_CORS_ALLOWED_ORIGINS` deve ser a origem exata do painel.
- O backup do painel tem os hashes das senhas e dos tokens. Guarde o arquivo fora do servidor.
