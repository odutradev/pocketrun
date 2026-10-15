# Guia de Padrões e Arquitetura Frontend (Code Guide)

Este documento define as regras arquiteturais, estruturais e de padronização de código do projeto no Frontend. A conformidade com este guia é **obrigatória**. Ele espelha as diretrizes de Clean Code e pragmatismo estabelecidas no Backend (`api/CODEGUIDE.md`) e define a arquitetura em React 19, TypeScript, Radix UI Themes, Zustand e Vite.

**DIRETRIZ OBRIGATÓRIA PARA A IA:** Este arquivo é o seu ponto de partida absoluto no Frontend. Ao receber qualquer solicitação para criar ou refatorar telas, componentes, hooks, stores ou integrações com a API, você deve refletir EXATAMENTE a estrutura descrita neste guia ANTES de gerar qualquer código. NUNCA recrie padrões ou utilitários que já estão documentados aqui.

---

## 1. Regras Fundamentais de Código e Estilo (Clean Code)

### 1.1. Nomenclatura e Idioma
- **Inglês Obrigatório:** Todo o código fonte (variáveis, funções, tipagens, componentes, hooks, stores, actions, chaves de objetos e rotas) deve ser escrito estritamente em **Inglês**. Apenas textos apresentados na interface do usuário (UI) e mensagens para o usuário final devem estar em português (pt-BR).
- **Formatação de Pastas e Arquivos:**
  - Todas as pastas do projeto utilizam **camelCase** (ex: `button`, `input`, `card`, `pageContainer`, `auth`, `home`, `resetPassword`, `welcomeBanner`, `profileCard`, `useForm`, `authHeader`). Nenhuma pasta deve iniciar com letra maiúscula.
  - Cada pasta de componente, hook, action, store ou rota deve ser um módulo autocontido contendo seu ponto de entrada `index.ts` (ou `index.tsx`) e seu arquivo de tipagens dedicado `types.ts`.
- **Zero Comentários no Código:** É expressamente proibido o uso de comentários (`//`, `/* */`, JSDoc) na lógica de código. O código deve ser declarativo, semântico e autodocumentado.

### 1.2. Export Default e Exportações
- **Padrão Exclusivo para Módulos:** Todo componente, tela, hook, store, cliente de API e arquivo central de configuração deve expor sua implementação principal através de **`export default`**.
- **Exportações Nomeadas Complementares:** Funções utilitárias, actions individuais (`signInAction`, `getProfileAction`), subcomponentes ou variantes podem também ser exportadas de forma nomeada no mesmo arquivo para conveniência e flexibilidade.
- **Consumo:** Os arquivos consumidores importam preferencialmente os módulos principais via default import:
  ```typescript
  import Button from '@components/ui/button'
  import useAuthStore from '@stores/auth'
  import apiClient from '@api/client'
  ```
- Sub-elementos de componentes compostos (como `CardHeader`, `CardTitle`) devem ser acoplados diretamente ao objeto principal (`Card.Header = CardHeader`) além de poderem ser exportados nominalmente.

### 1.3. Proibição de Barrel Files Genéricos
- É expressamente proibido criar arquivos `index.ts` que sirvam exclusivamente para reexportar múltiplos submódulos (`export * from './...'`).
- Cada funcionalidade deve ser importada diretamente de sua pasta específica. Isso garante *tree-shaking* eficiente, elimina riscos de dependência circular e acelera a compilação do Vite.
- *Exceção controlada:* Agrupadores internos estritamente locais de subcomponentes de rota (`routes/components/index.ts`) que exportam apenas os itens de uso direto do módulo.

### 1.4. Mapeamento de Aliases e Organização de Imports

#### Aliases Configurados no Projeto (`tsconfig.app.json` e `vite.config.ts`):
- `@actions/*`: `./src/actions/*`
- `@components/*`: `./src/components/*`
- `@hooks/*`: `./src/hooks/*`
- `@stores/*`: `./src/stores/*`
- `@api/*`: `./src/api/*`
- `@projectTypes/*`: `./src/types/*`
- `@pages/*`: `./src/pages/*`
- `@routes`: `./src/routes`
- `@routes/*`: `./src/routes/*`
- `@styles/*`: `./src/styles/*`

> **Nota:** O alias de tipos utiliza `@projectTypes/*` para espelhar a convenção do Backend e evitar conflitos com o escopo `@types` reservado pelo TypeScript.

#### Regras de Importação (Regra dos 3 Blocos):
A organização dos imports deve seguir exatamente **três blocos** separados por uma linha em branco, ordenados visualmente do **MAIOR** (mais caracteres) para o **MENOR** (menos caracteres) dentro de cada bloco:

1. **Bibliotecas Externas:** (ex: `@radix-ui/themes`, `react-router-dom`, `zustand`, `react`)
2. **Módulos Internos:** (ex: `@components/...`, `@stores/...`, `@actions/...`, `@api/...`, caminhos relativos `./...`)
3. **Tipagens:** (ex: `import type { ... }`)

**Regra de Linha Única:** É estritamente proibido quebrar linhas dentro de chaves de desestruturação nos imports.

```typescript
import { Button as RadixButton, type ButtonProps as RadixButtonProps } from '@radix-ui/themes'

import { STORAGE_KEYS } from '@api/config'
import apiClient from '@api/client'

import type { SignInPayload, SignUpPayload } from '@actions/users/auth/types'
import type { ButtonProps, ButtonVariant } from './types'
```

### 1.5. Estruturas e Padrões de Escrita
- **Arrow Functions:** Utilize Arrow Functions para a declaração de componentes, hooks, stores e actions.
- **Early Returns:** Evite aninhamentos desnecessários de `if/else`. Aborte fluxos antecipadamente validando estados de carregamento, erros ou ausência de dados.
- **Imutabilidade:** O uso de `let` é desencorajado. Mantenha o estado estritamente imutável utilizando setters com callback funcional quando dependente do estado anterior (`prev => ...`).
- **Tipagem Estrita:** O uso de `any` é terminantemente proibido. Todas as props, retornos de hooks, estados de stores e payloads de actions devem ser tipados em seus respectivos arquivos `types.ts`.
- **Console Log Proibido:** É expressamente proibido manter instruções de `console.log` no código final de produção.

---

## 2. Estrutura Geral do Projeto

A arquitetura do frontend estrutura cada elemento da aplicação em fatias modulares, autocontidas e desacopladas:

```text
src/
├── actions/                  # Actions HTTP isoladas por domínio de negócio
│   └── users/
│       ├── auth/             # signInAction, signUpAction, refreshTokenAction
│       │   ├── index.ts
│       │   └── types.ts
│       ├── profile/          # getProfileAction, updateProfileAction, resetPasswordAction
│       │   ├── index.ts
│       │   └── types.ts
│       └── validation/       # requestCodeAction, verifyCodeAction
│           ├── index.ts
│           └── types.ts
├── api/                      # Infraestrutura HTTP central
│   ├── client.ts             # Cliente HTTP e utilitários (request, get, post, put, del, apiClient)
│   └── config.ts             # API_BASE_URL e STORAGE_KEYS
├── assets/                   # Recursos estáticos locais
├── components/               # Componentes visuais reutilizáveis
│   ├── layout/               # Componentes estruturais de layout
│   │   ├── navbar/           # Barra de navegação com dados de sessão e ações
│   │   │   └── index.tsx
│   │   └── pageContainer/    # Container principal com suporte à centralização
│   │       ├── index.tsx
│   │       └── types.ts
│   └── ui/                   # Componentes de interface baseados no Radix UI Themes
│       ├── badge/            # Badge com variantes e cores semânticas do Radix
│       │   ├── index.tsx
│       │   └── types.ts
│       ├── button/           # Button com variantes, estados de loading e ícones
│       │   ├── index.tsx
│       │   └── types.ts
│       ├── card/             # Card com subcomponentes e suporte a glassmorphism
│       │   ├── index.tsx
│       │   └── types.ts
│       ├── input/            # TextField e PasswordField com tratamento de erro
│       │   ├── index.tsx
│       │   └── types.ts
│       ├── select/           # Select customizado baseado no Radix
│       │   ├── index.tsx
│       │   └── types.ts
│       └── toast/            # Container flutuante que renderiza mensagens da toast store
│           ├── index.tsx
│           └── types.ts
├── hooks/                    # Custom hooks transversais reutilizáveis
│   └── useForm/              # Gerenciador completo de formulários controlados
│       ├── index.ts
│       └── types.ts
├── pages/                    # Telas da aplicação organizadas em fatias completas
│   ├── auth/
│   │   ├── components/       # Subcomponentes exclusivos da tela de auth
│   │   │   ├── authHeader/
│   │   │   ├── authTabs/
│   │   │   ├── loginForm/
│   │   │   └── registerForm/
│   │   ├── hook/             # Hook de lógica e regras de negócio da tela (useAuthPage)
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── index.tsx         # Orquestração visual da tela (AuthPage - export default)
│   │   ├── styles.ts         # Estilos tipados da tela (CSSProperties)
│   │   └── types.ts          # Contratos e tipos locais da tela
│   ├── home/
│   │   ├── components/       # Subcomponentes exclusivos da home
│   │   │   ├── actionExecutorCard/
│   │   │   ├── profileCard/
│   │   │   ├── systemStatusGrid/
│   │   │   └── welcomeBanner/
│   │   ├── hook/             # Hook de lógica da tela (useHomePage)
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── index.tsx         # Orquestração visual da tela (HomePage - export default)
│   │   ├── styles.ts         # Estilos tipados da tela (CSSProperties)
│   │   └── types.ts          # Contratos e tipos locais da tela
│   └── resetPassword/
│       ├── components/       # Subcomponentes exclusivos do reset de senha
│       │   └── resetPasswordForm/
│       ├── hook/             # Hook de lógica da tela (useResetPasswordPage)
│       │   ├── index.ts
│       │   └── types.ts
│       ├── index.tsx         # Orquestração visual da tela (ResetPasswordPage - export default)
│       ├── styles.ts         # Estilos tipados da tela (CSSProperties)
│       └── types.ts          # Contratos e tipos locais da tela
├── routes/                   # Roteamento central e guards de navegação
│   ├── components/           # Wrappers de proteção e layout
│   │   ├── appLayout/        # Layout global (fundo gradiente, Navbar, ToastContainer)
│   │   ├── protectedRoute/   # Guarda que redireciona não autenticados para /auth
│   │   ├── publicRoute/      # Guarda que redireciona autenticados para /
│   │   └── index.ts
│   ├── index.tsx             # Router e mapeamento do array RouteItem[] (export default)
│   └── types.ts              # Definição da interface RouteItem
├── stores/                   # Gerenciamento de estado global reativo via Zustand
│   ├── auth/                 # useAuthStore (user, token, login, register, logout, init)
│   │   ├── index.ts
│   │   └── types.ts
│   ├── navigation/           # useNavigationStore (navegação auxiliar por hash)
│   │   ├── index.ts
│   │   └── types.ts
│   └── toast/                # useToastStore (fila de toasts, showToast, removeToast)
│       ├── index.ts
│       └── types.ts
├── styles/                   # Tema central e configuração visual do Radix UI
│   └── theme.ts              # Configuração do Theme Radix (appearance, accentColor, radius)
├── types/                    # Tipos transversais e modelos de domínio
│   ├── api.ts                # ApiError, ApiResponse
│   └── user.ts               # UserProfile, UserRole
└── main.tsx                  # Ponto de entrada React com Radix Theme e verificação de sessão
```

---

## 3. Padrão Arquitetural de Telas (Self-Contained Page Slice)

Cada página localizada em `@pages/<pageName>` deve ser uma unidade totalmente autocontida dividida em cinco partes obrigatórias:

### 3.1. `index.tsx` (Composição Visual Declarativa)
- A tela principal deve ser extremamente enxuta.
- Sua função é **exclusivamente compor a interface visual** a partir de seus subcomponentes.
- É proibido conter estados soltos (`useState`), efeitos (`useEffect`) ou regras de negócio complexas diretamente dentro de `index.tsx`.
- Toda a lógica é consumida do hook exclusivo da tela (`import use<Name>Page from './hook'`).

```tsx
export const AuthPage = () => {
  const {
    authMode,
    title,
    subtitle,
    isResetMode,
    handleModeChange,
    goToLogin,
    goToReset
  } = useAuthPage()

  return (
    <Box w="100%" style={containerStyle}>
      <AuthHeader title={title} subtitle={subtitle} isResetMode={isResetMode} />
      <Card>
        <CardContent>
          {isResetMode ? (
            <ResetPasswordForm onSuccess={goToLogin} onCancel={goToLogin} />
          ) : (
            <>
              <AuthTabs value={authMode} onChange={handleModeChange} />
              {authMode === 'login' ? <LoginForm onForgotPassword={goToReset} /> : <RegisterForm />}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AuthPage
```

### 3.2. `hook/` (Centralização de Regras de Negócio da Página)
- Cada página possui uma pasta dedicada `hook/` com seu `index.ts` e `types.ts`.
- O hook deve se chamar `use<PageName>Page` (ex: `useAuthPage`, `useHomePage`, `useResetPasswordPage`).
- Concentra **100% da inteligência da tela**: estados locais, valores derivados/computados, handlers de evento, chamadas a actions HTTP e interações com stores.
- Retorna um objeto estritamente tipado definido na interface `Use<PageName>PageReturn` em `hook/types.ts`.

### 3.3. `components/` (Subcomponentes Modulares da Tela)
- Componentes que pertencem unicamente a uma tela específica vivem dentro da pasta `components/` dessa tela.
- Cada subcomponente segue o padrão de pasta autocontida em **camelCase**:
  - `pages/<pageName>/components/<componentName>/index.tsx`
  - `pages/<pageName>/components/<componentName>/types.ts`
- Isso evita a poluição do catálogo global de `@components/ui`.

### 3.4. `styles.ts` (Estilos Dedicados da Página)
- Centraliza objetos de estilo específicos da tela tipados como `CSSProperties` da React.
- Evita poluição de objetos literais inline no JSX e facilita a manutenção.

```typescript
import type { CSSProperties } from 'react'

export const containerStyle: CSSProperties = {
  maxWidth: 460,
  margin: '0 auto'
}
```

### 3.5. `types.ts` (Contratos Locais)
- Define os tipos, enums ou uniões literais exclusivos daquela tela (ex: `type AuthMode = 'login' | 'register' | 'reset'`).

---

## 4. Gerenciamento de Estado Global com Zustand (`@stores/*`)

O projeto utiliza **Zustand** como solução padrão e exclusiva de gerenciamento de estado global. Contextos React tradicionais (`React.createContext`) foram eliminados para garantir máxima performance, evitar re-renderizações em cascata e simplificar o consumo sem a necessidade de árvores profundas de Providers.

### 4.1. `useAuthStore` (`@stores/auth`)
- Gerencia o ciclo de vida completo da sessão de autenticação do usuário.
- **Estado Reativo:**
  - `user`: Dados do perfil logado (`UserProfile | null`).
  - `token`: Token JWT atual (`string | null`).
  - `isAuthenticated`: Booleano calculado com base na existência de token e usuário válidos.
  - `isLoading`: Booleano que indica verificação inicial de sessão.
- **Ações:**
  - `login(credentials)`: Autentica o usuário, armazena tokens no `localStorage` via `STORAGE_KEYS`, busca o perfil e atualiza o estado.
  - `register(data)`: Cadastra o usuário e realiza a inicialização idêntica ao login.
  - `logout()`: Limpa tokens e dados do `localStorage` e redefine o estado.
  - `initializeAuth()`: Invocado na inicialização da aplicação (`main.tsx`) para validar e hidratar o perfil do usuário caso exista token salvo.
  - `refreshUser()`: Revalida os dados cadastrais do usuário via API.

### 4.2. `useToastStore` (`@stores/toast`)
- Gerencia notificações flutuantes na interface do usuário.
- **Ações:**
  - `showToast(message, type, title?)`: Enfileira uma notificação dos tipos `'success' | 'error' | 'warning' | 'info'`.
  - Auto-dismiss automático após 4000ms.
  - `removeToast(id)`: Remove a notificação imediatamente.
- **Renderização:** O componente `@components/ui/toast` consome diretamente essa store e é injetado globalmente no `AppLayout`.

### 4.3. `useNavigationStore` (`@stores/navigation`)
- Fornece suporte a navegação por hash alternativa (`AppRoute = 'home' | 'reset-password'`).
- Sincroniza eventos de `hashchange` com a store de forma reativa.

---

## 5. Roteamento, Guards e Layout Global (`@routes/*`)

O sistema de rotas utiliza **React Router DOM v7** estruturado de maneira declarativa em `@routes/index.tsx`.

### 5.1. Mapeamento de Rotas (`RouteItem[]`)
As rotas são declaradas em um array de configuração com tipagem estrita:

```typescript
export interface RouteItem {
  path: string
  component: ComponentType
  protected?: boolean
  publicOnly?: boolean
  center?: boolean
}
```

- `protected: true`: A rota só pode ser acessada por usuários autenticados.
- `publicOnly: true`: A rota só pode ser acessada por visitantes não autenticados (ex: `/auth`).
- `center: true`: O `PageContainer` aplicará centralização vertical e horizontal automática ao conteúdo.

### 5.2. Guards de Navegação
- **`ProtectedRoute` (`@routes/components/protectedRoute`):**
  - Verifica `isAuthenticated` via `useAuthStore`.
  - Se falso, redireciona o usuário para `/auth` com `<Navigate to="/auth" replace />`.
- **`PublicRoute` (`@routes/components/publicRoute`):**
  - Verifica `isAuthenticated` via `useAuthStore`.
  - Se verdadeiro, redireciona o usuário autenticado para a página inicial `/`.

### 5.3. Layout Global (`AppLayout`)
O `AppLayout` envolve todas as rotas da aplicação fornecendo:
- Background escuro moderno (`#0c101c`) com gradientes radiais fixos (`radial-gradient`).
- Renderização condicional da `Navbar` apenas para sessões autenticadas (`isAuthenticated && <Navbar />`).
- Container global de mensagens de feedback `<ToastContainer />`.

---

## 6. Camada de Comunicação com a API (`@actions/*` e `@api/*`)

### 6.1. Actions por Domínio (`@actions/<domain>/<feature>`)
- Cada pasta dentro de `@actions` corresponde a um subdomínio funcional da API (ex: `users/auth`, `users/profile`, `users/validation`).
- **Nomenclatura Obrigatória:** Todas as funções de action devem possuir o sufixo `Action` (ex: `signInAction`, `signUpAction`, `refreshTokenAction`, `getProfileAction`, `updateProfileAction`, `resetPasswordAction`, `requestCodeAction`, `verifyCodeAction`).
- **Arquivos Obrigatórios:**
  - `index.ts`: Implementa e exporta as funções assíncronas que chamam os métodos do `apiClient`.
  - `types.ts`: Define os tipos dos parâmetros de entrada (Payloads) e saídas esperadas (Responses).

```typescript
import apiClient from '@api/client'

import type { SignInPayload, AuthResponse } from './types'

export const signInAction = async (payload: SignInPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/users/signin', payload, { skipAuth: true })
}
```

### 6.2. Cliente HTTP Central (`@api/client` e `@api/config`)
- **Utilitários Exportados:** `request<T>()`, `get<T>()`, `post<T>()`, `put<T>()`, `del<T>()`.
- **`apiClient`:** Objeto utilitário com os métodos (`request`, `get`, `post`, `put`, `delete`) exportado como `export default`.
- **Autenticação Automática:** Injeta o cabeçalho `Authorization: Bearer <token>` a partir do `localStorage` em todas as requisições, exceto quando `skipAuth: true` for explicitamente informado.
- **Normalização de Erros:** Qualquer resposta HTTP com status de erro é interceptada e convertida para o formato `ApiError` contendo `message`, `status` e `details`.
- **Configurações Globais (`@api/config`):**
  - `API_BASE_URL`: URL base configurada para apontar para a API Express.
  - `STORAGE_KEYS`: Constante que centraliza as chaves do `localStorage` (`TOKEN`, `REFRESH_TOKEN`, `USER`).

---

## 7. Design System, Radix UI Themes e Estilização

### 7.1. Tema Central Radix UI (`@styles/theme.ts`)
- O projeto adota o **Radix UI Themes** configurado no `main.tsx` através do `<Theme>` importando `@radix-ui/themes/styles.css`.
- O tema padroniza:
  - `appearance: 'dark'`
  - `accentColor: 'iris'`
  - `grayColor: 'slate'`
  - `radius: 'medium'`
  - `scaling: '100%'`

### 7.2. Componentes Reutilizáveis de UI (`@components/ui/*`)
Todos os componentes reutilizáveis de interface encapsulam e adaptam os componentes do Radix UI Themes para a identidade visual do projeto:
- **`Button`:** Mapeia variantes (`solid`, `soft`, `outline`, `ghost`) e cores semânticas (`iris`, `gray`, `red`, etc.) do Radix UI, com suporte a estado `loading`, `leftIcon` e `rightIcon`.
- **`Input`:** Encapsula `TextField.Root` e `TextField.Slot` do Radix UI com suporte a tipos texto e senha, rótulos, ícones e mensagens de erro integradas.
- **`Card`:** Encapsula `Card` do Radix UI com efeito de vidro (*glassmorphism*, `backdropFilter: 'blur(16px)'`, fundo translúcido `var(--gray-a2)` e bordas `var(--gray-a4)`). Expõe os subcomponentes compostos: `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content` e `Card.Footer`.
- **`Badge`:** Encapsula `Badge` do Radix UI mapeando variantes (`surface`, `soft`, `solid`) e cores semânticas (`iris`, `grass`, `amber`, `red`, `gray`).
- **`Toast`:** Componente que se conecta ao `useToastStore` e exibe os alertas flutuantes com animação e cores adequadas.

### 7.3. Regras de Estilização
- **CSS Modules e Tailwind NÃO são utilizados.**
- Use os componentes primitivos de layout do Radix UI (`Box`, `Flex`, `Grid`, `Container`, `Section`) e suas props nativas (`p`, `px`, `py`, `m`, `mt`, `mb`, `gap`, `direction`, `align`, `justify`).
- Para cores, tokens e raios, utilize as variáveis CSS do Radix UI (ex: `var(--iris-9)`, `var(--gray-a2)`, `var(--gray-a4)`, `var(--gray-12)`, `var(--radius-4)`).
- Para estilos específicos de telas ou containers, use objetos de estilo tipados com `CSSProperties` em `styles.ts`.
- Mantenha paleta escura consistente com contraste acessível, superfícies translúcidas e destaques em tons de `iris` e `cyan`.

---

## 8. Custom Hooks Globais (`@hooks/*`)

### 8.1. `useForm` (`@hooks/useForm`)
Hook universal para controle e validação de formulários React sem necessidade de bibliotecas externas pesadas:
- **Parâmetros (`UseFormOptions<T>`):**
  - `initialValues`: Valores iniciais dos campos do formulário.
  - `validationRules`: Dicionário opcional contendo funções validadoras por campo (`(value, allValues) => string | undefined`).
  - `onSubmit`: Função assíncrona executada quando a submissão for válida.
- **Retorno (`UseFormReturn<T>`):**
  - `values`: Estado atual dos campos.
  - `errors`: Erros atuais por campo.
  - `touched`: Registro de campos já focados/tocados pelo usuário.
  - `isSubmitting`: Booleano que indica se a submissão assíncrona está em andamento.
  - `handleChange`: Handler padrão para inputs nativos ou componentes controlados.
  - `setFieldValue(name, value)`: Helper para atualização direta de um campo específico.
  - `handleBlur`: Handler de desfoco para acionar validação no campo tocado.
  - `handleSubmit`: Handler de submissão que valida todos os campos antes de acionar `onSubmit`.
  - `resetForm`: Restaura o formulário para seus valores iniciais e limpa erros.
  - `setErrors`: Helper para injeção manual de mensagens de erro (ex: erros retornados pela API).

---

## 9. Fluxo de Validação de Qualidade

Antes de considerar qualquer entrega finalizada, execute obrigatoriamente os scripts de validação:

1. **Linting de Código:**
   ```bash
   npm run lint
   ```
   Utiliza o `oxlint` para análise estática rápida. Nenhum erro ou warning deve ser deixado para trás.

2. **Verificação de Tipos e Build de Produção:**
   ```bash
   npm run build
   ```
   Executa `tsc -b` (TypeScript) e `vite build`. Garante que não haja quebras de tipos nem inconsistências em módulos importados.