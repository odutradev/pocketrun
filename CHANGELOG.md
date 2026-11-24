# Changelog

Tudo o que muda entre as versões do PocketRun. Leia antes de atualizar uma instância própria: a seção **Ação necessária** lista o que você precisa mudar no deploy.

As versões seguem o `version` do `package.json`, e cada uma vira as imagens `odutradev/pocketrun-api` e `odutradev/pocketrun-ui` no Docker Hub. As entradas anteriores à seção "Não publicado" vêm das mensagens dos commits, em inglês.

## Não publicado

### Ação necessária

- **Todas as variáveis de ambiente passam a ser obrigatórias.** A API não inicia se faltar uma delas ou se o valor for inválido, e o log diz qual corrigir. Confira `HOST`, `PORT`, `CORS_ALLOWED_ORIGINS`, `ADMIN_CORS_ALLOWED_ORIGINS`, `MONGODB_URI`, `MONGODB_NAME`, `JWT_SECRET`, `PAGE_ACCESS_SECRET` e `LINKS_URL`.
- **`JWT_SECRET` e `PAGE_ACCESS_SECRET` precisam de 32 caracteres ou mais e não podem ser iguais.** Gere com `openssl rand -hex 32`. Trocar o `JWT_SECRET` encerra as sessões do painel e zera a contagem de visitantes únicos. Trocar o `PAGE_ACCESS_SECRET` invalida os PINs das páginas.
- **Sem `PAGE_ACCESS_SECRET`, a API não deriva mais a chave dos PINs do `JWT_SECRET`.** Se a sua instância rodava sem ele, defina `PAGE_ACCESS_SECRET=page-access:` seguido do seu `JWT_SECRET` para manter os PINs atuais.
- **`LINKS_URL` é obrigatório.** Links e páginas só abrem nesse domínio.
- **O painel lê `API_URL` e `LINKS_URL` quando o container sobe.** Passe as duas no serviço `ui` do compose. `VITE_API_URL` deixa de valer no deploy.
- **O compose não fixa mais `dns: 8.8.8.8 / 1.1.1.1`.** Se o container da API não resolver um endereço `mongodb+srv://`, adicione `dns:` no seu compose.

### Novidades

- A mesma imagem do painel serve para qualquer domínio, sem compilar de novo.
- As imagens da API e do painel têm `HEALTHCHECK`. O painel só sobe depois que a API responde, e a API ganhou o subcomando `api healthcheck`.
- Exemplos de compose com MongoDB local (volume e healthcheck) e com MongoDB externo, e o `.env.selfhost.example`.
- `LICENSE` (ISC), `SECURITY.md` e este `CHANGELOG.md`.

## 1.7.8 (2026-11-24)

### Novidades

- print colored text logs instead of json
- add link status endpoint
- toggle link status from the list
- serve links and pages only on the links domain

## 1.7.7 (2026-11-24)

Só manutenção, documentação e ajustes internos.

## 1.7.6 (2026-11-24)

Só manutenção, documentação e ajustes internos.

## 1.7.5 (2026-11-24)

### Correções

- drop legacy application indexes that block kv creation

## 1.7.4 (2026-11-20)

### Correções

- pass the project build context to the ui image in ci

## 1.7.3 (2026-11-20)

Só manutenção, documentação e ajustes internos.

## 1.7.2 (2026-11-20)

### Novidades

- share the public llms.txt link in the docs

### Correções

- serve panel text files as utf-8
- serve text files as utf-8 in the vite dev server

## 1.7.1 (2026-11-20)

### Novidades

- add instance backup export and restore to the api
- add backup actions, types and helpers to the panel
- add backup page to export and restore the instance
- move documentation to a general page in the menu

## 1.7.0 (2026-11-20)

### Correções

- count page kv requests in overview usage from the request log

## 1.6.9 (2026-11-20)

### Novidades

- count kv requests per hour and expose environment usage
- add period, csv export and service usage chart to overview
- let click limits count unique visitors instead of clicks
- add a click or unique visitor toggle to limit activation

## 1.6.8 (2026-11-20)

### Novidades

- add an environment overview page as the panel home

## 1.6.7 (2026-11-20)

### Novidades

- add page-owned kv applications with base roles
- enable page data with a dedicated kv application
- mark page kv applications and block their removal
- replace the kv app picker with one-click page data

## 1.6.6 (2026-11-20)

### Novidades

- add count, eval, import and export routes to the kv api
- add roles with collection permissions to kv applications
- add kv roles tab and token roles to the panel
- link kv applications to pages through a same-origin bridge
- add a data tab and kv preview bridge to the page editor

### Correções

- record kv role mappings as text in the page history

## 1.6.5 (2026-11-18)

### Novidades

- add a crud with kv template for new pages
- add a kv documentation page to the panel

## 1.6.4 (2026-11-18)

### Novidades

- add application filters, sorting and editor tab data
- redesign the kv list like the pages and links lists
- turn the application page into a tabbed editor

## 1.6.3 (2026-11-18)

### Novidades

- inject a window.pocketrun runtime into served pages
- add the pocketrun runtime to the editor preview

## 1.6.2 (2026-11-18)

### Novidades

- secure panel login with argon2id, attempt limits and session cookie
- use cookie sessions in the panel and add sign out everywhere

## 1.6.1 (2026-11-18)

### Correções

- drop the one-time warning when a page pin is created

## 1.6.0 (2026-11-18)

### Novidades

- store page pins encrypted so they can be shown again
- add view, copy and edit actions to page pins

## 1.5.9 (2026-11-18)

### Novidades

- let each page set how long a pin unlock lasts
- add access duration select to the page access tab

## 1.5.8 (2026-11-18)

### Novidades

- add six digit pin input component
- type or generate the pin in the access dialog
- show six pin boxes on the protected page gate

## 1.5.7 (2026-11-18)

### Correções

- move the page access status route off the groups pattern

## 1.5.6 (2026-11-18)

### Novidades

- add pin protection with roles for pages
- ask for the pin before serving a protected page
- add page access tab to manage pins and roles

## 1.5.5 (2026-11-18)

### Novidades

- add version messages and keep the last 50 page versions
- add version messages and compare any two page versions
- keep unsaved page drafts in the browser and offer to recover them
- format and check page html in the editor

## 1.5.4 (2026-11-18)

### Novidades

- filter and sort single-page link lists locally
- add the pages domain with versions, history and analytics
- add page types, actions and shared list helpers
- add the pages panel with editor, versions and diff
- add view modes, full screen and a readable diff to the page editor

### Correções

- wait longer before searching links while typing

## 1.5.3 (2026-11-18)

### Novidades

- read the public links url from the environment
- build short link urls from the public links url

## 1.5.2 (2026-11-18)

### Novidades

- harden link redirects and add list filters and overview
- add state filter and sorting to the links list
- add a qr code tab and group preselection to the link editor
- add the links analytics overview page

## 1.5.1 (2026-11-18)

### Novidades

- add color and icon to groups
- add group color and icon options to the frontend
- replace the groups dialog with group pages and settings

## 1.5.0 (2026-11-18)

### Novidades

- show parent pages as a breadcrumb in the page header
- use a breadcrumb title inside a link group
- show the list total before the links search
- show an accent spinner in place of the search icon while loading
- keep the search spinner visible for at least 500 ms
- restore the cached links list when the search is cleared
- color the current breadcrumb page with the accent
- show the links and group breadcrumb in the link editor

### Correções

- place the links total between search and view toggle

## 1.4.9 (2026-11-18)

### Novidades

- show group cards and ungrouped links on the links page
- place the links toolbar between groups and links
- add search, pagination and group totals to the links API
- add a debounced search input component
- paginate and search the links list through the API
- search single-page link lists locally

## 1.4.8 (2026-11-17)

### Novidades

- open the short link from the links list slug

## 1.4.7 (2026-11-17)

### Novidades

- smooth page transitions in link history
- bind the API to localhost in local development

## 1.4.6 (2026-11-17)

### Novidades

- add delete action to the link editor
- clear strikethrough when hovering history changes
- return total count in link history
- paginate link history and show total beside filters
- show defined and removed tags for empty history values
- center history pagination

## 1.4.5 (2026-11-17)

### Novidades

- stretch link editor tabs to full width
- limit link title to 20 characters
- open the link editor after creating or saving a link

## 1.4.4 (2026-11-17)

### Novidades

- add icon-only mode to button and link button

### Correções

- keep content navbar on one line on mobile
- animate mobile logo after the menu closes
- show links view toggle only on desktop

## 1.4.3 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.4.2 (2026-11-17)

### Novidades

- add link change history and open analytics endpoints
- support icon-only segments and hidden select labels
- simplify links table and add list and cards view toggle
- add link history and analytics types and actions
- split the link editor into settings, analytics and history tabs
- add link change history timeline
- add link analytics dashboard with recharts
- stack data table rows as cards on mobile
- show a compact link list on mobile

### Correções

- stop dialog form submits from submitting the parent form
- keep link form and analytics within mobile width

## 1.4.1 (2026-11-17)

### Novidades

- add an action item to the select dropdown
- move new group into the group dropdown
- require a link slug and validate the destination url
- stretch range slider to manual values above its max
- animate range slider to manually typed values
- add copy button to the link public url

### Correções

- set the minimum click limit to one
- require only the end date in custom link periods

## 1.4.0 (2026-11-17)

### Novidades

- add range field with slider and exact value input
- add period presets and click limit slider to link form
- start link slug empty and generate it on save
- replace native select with themed dropdown
- add protocol selector to link destination
- create link groups from the link form

## 1.3.9 (2026-11-17)

### Correções

- make link and security forms fill the page width

## 1.3.8 (2026-11-17)

### Novidades

- add content navbar component
- use content navbar in service pages
- center logo loader in content area
- add shared slug registry
- add groups domain for links and pages
- add links domain with schedules and click limits
- wire links admin routes and public redirect
- list services before panel in the sidebar
- add trailing slot to input and extra navbar actions
- add links actions, types and validations
- add links list page with groups
- add shared create and edit page for links
- mark links as live in the brand tools
- allow a button variant on the content navbar action
- use content navbar in users, profile and app details

## 1.3.7 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.3.6 (2026-11-17)

### Correções

- let the profile page use the full page area

## 1.3.5 (2026-11-17)

### Novidades

- count applications per manager
- add user management and profile routes to the api
- add user management types, actions and validations to the panel
- replace the top navbar with a side menu
- add users management and profile pages
- add a services group to the side menu
- add kv, pages and links service pages
- add context transition and hover variants to the brand mark
- animate the side menu logo when the product changes
- add pulsing api status dot with address and version tooltip
- move api status next to the side menu logo

### Correções

- keep blade intro from restarting on pose changes

## 1.3.4 (2026-11-17)

### Novidades

- remove sign-up from the login page

## 1.3.3 (2026-11-17)

### Novidades

- add database reset command with optional superadmin
- redirect setup page to login when a manager exists
- recheck setup status after a failed setup submit

## 1.3.2 (2026-11-17)

### Correções

- use brand symbol as site favicon
- keep PocketRun as the browser title on every page

## 1.3.1 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.3.0 (2026-11-17)

### Correções

- expose service ports only locally to avoid host port conflicts

## 1.2.9 (2026-11-17)

### Novidades

- redesign panel with brand design system components

## 1.2.8 (2026-11-17)

Só manutenção, documentação e ajustes internos.

## 1.2.7 (2026-11-17)

### Novidades

- add brand mark component with all identity variations
- add motion section to visual identity page

## 1.2.6 (2026-11-17)

### Correções

- use brass tone for run letter in light logo

## 1.2.5 (2026-11-17)

### Novidades

- add brand tokens, data and asset builders
- add brand symbol and logo components
- add visual identity page at /id

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

- add user repository and model in repositories package

## 1.1.8 (2026-10-27)

Só manutenção, documentação e ajustes internos.

## 1.1.7 (2026-10-27)

### Novidades

- segregate admin and public routers with dedicated endpoints
- add dual-listener and mode support for public and admin servers
- configure docker and ui to consume segregated admin api
- migrate health and setup domains with unified handlers and routes
- unify handlers and routes in user, application and kv domains
- add system store for local user settings and theme mode
- update radix theme palette to vivo verde-azulado and bind appearance to system store
- apply mint theme across components and add navbar dark mode toggle

## 1.1.6 (2026-10-20)

Só manutenção, documentação e ajustes internos.

## 1.1.5 (2026-10-15)

### Correções

- synchronize package-lock with dependencies for docker build

## 1.1.4 (2026-10-15)

Só manutenção, documentação e ajustes internos.

## 1.1.3 (2026-10-15)

### Novidades

- add concurrently dev script to run api and ui concurrently
- install and configure radix ui themes
- migrate navbar, auth and setup wizard to radix ui
- migrate dashboard, create app and token modals to radix ui
- migrate app detail and data explorer to radix ui
- add global types and centralized api client infrastructure
- add domain http actions and contract types
- add zustand stores for auth, toast and navigation
- add design system ui components, layout and useForm hook
- implement self-contained page slices for auth, setup and home
- implement declarative routing, layout guards and integrate main entrypoint

## 1.1.2 (2026-10-15)

### Novidades

- implement initial superadmin setup endpoints and verification
- add initial superadmin setup wizard component in ui
- integrate setup flow into app routing and auth guards

## 1.1.1 (2026-10-15)

### Correções

- replace host ports with expose to allow repeating ports in Dokploy without conflict

## 1.1.0 (2026-10-15)

### Correções

- change default host port to 5002 to avoid conflict with existing service on 5000

## 1.0.9 (2026-10-15)

### Novidades

- align ports with reference compose using port 80 and port 5000

## 1.0.8 (2026-10-15)

### Correções

- use API_PORT and safe UI port default to prevent host port 3000 collision

## 1.0.7 (2026-10-15)

Só manutenção, documentação e ajustes internos.

## 1.0.6 (2026-10-15)

### Novidades

- add JWT_SECRET configuration to docker-compose and docs

## 1.0.5 (2026-10-15)

Só manutenção, documentação e ajustes internos.

## 1.0.4 (2026-09-23)

### Correções

- fix compilation errors in app_handler.go and kv_handler.go

## 1.0.3 (2026-09-23)

### Novidades

- implement manager auth, application management and v2 cors control

## 1.0.2 (2026-09-23)

### Correções

- add go mod tidy to api docker build

## 1.0.1 (2026-09-23)

### Novidades

- initial commit
- creates base rest api structure with router, cors, env and ping
- refactor api by domain and create health domain
- removing the test, initially unnecessary
- add dockerfile docker-compose and readme for dokploy
- initialize ui frontend base structure with react vite and typescript
- add ui service to docker compose and update documentation
- add github actions workflow for build and push to docker hub
- update docker-compose and readme with dokploy and hostinger support
- connect api to mongodb and add success log to console
- add support and documentation for local and remote mongodb via uri

### Correções

- adding the .env
- add error check for config scanner and validate ping tests
- change default ui port to 3001 in docker compose to prevent host port collision
- replace host ports with expose in dokploy compose to prevent port collisions
- adjust healthcheck status validation to accept success response
- remove fixed host port mappings to avoid conflicts on dokploy
