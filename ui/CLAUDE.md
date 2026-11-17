# Frontend standards guide

This guide defines this frontend's architecture, component, state and code rules. Following it is **mandatory**.

**Directive:** before creating or refactoring pages, components, hooks or stores, read this guide and follow exactly the structure and standards described here. Before creating a component or hook, look for an existing equivalent in the project.

## 1. Stack

| Item | Choice |
| :--- | :--- |
| Framework | React + Vite |
| Language | TypeScript (100% typed) |
| Base components | @radix-ui/themes |
| Styling | Styled Components |
| Global state | Zustand |
| Requests | Axios |
| Forms | Zod |
| E2E tests | No E2E |

## 2. Architecture: Folders by type

The root of `src` splits code by role: API actions, components, hooks, pages, routes, stores, styles and utilities.

**Rules:**

- API calls live in `src/actions/<domain>`. Components and pages never call the HTTP client directly.
- Reusable components live in `src/components`, one per folder.
- Custom hooks live in `src/hooks`, one per folder, always prefixed with `use`.
- Each page lives in `src/pages/<page>` and declares its layout metadata (title, permissions).
- Global state lives in `src/stores/<store>`. Local state stays in the component.
- Helpers, types and validations live in `src/utils/functions`, `src/utils/types` and `src/utils/validations`.
- Type declarations (`interface` and `type`) live only in `types.ts` files, never in `index.ts(x)`, `store.ts`, `table.tsx` or `theme.ts`:
  - Components, subcomponents, tabs and sections: `types.ts` in their own folder.
  - Pages: `hook/types.ts`, including the page store's shape. Types of `table.tsx` go in the page's `types.ts`.
  - Global stores: `src/stores/<store>/types.ts`. Theme: `src/styles/types.ts`.
  - Domain types shared across folders, and types inferred from Zod schemas (`z.infer`), live in `src/utils/types/<domain>`. Validation files hold only schemas.
  - The only exception is a type that depends on a function's generic parameter and cannot exist outside it.

**Folder structure:**

```text
.
└── src/
    ├── actions/
    │   └── user/
    │       └── index.ts  # chamadas à API
    ├── assets/
    │   ├── config/
    │   │   └── index.ts
    │   └── data/
    │       └── index.ts  # dados estáticos
    ├── components/
    │   └── userCard/
    │       ├── subcomponents/
    │       │   └── userAvatar/
    │       │       └── index.tsx  # subcomponente do componente
    │       ├── index.tsx  # componente
    │       ├── skeleton.tsx  # skeleton
    │       ├── styles.ts  # estilos
    │       └── types.ts  # props
    ├── hooks/
    │   └── useAction/
    │       └── index.ts  # hook
    ├── pages/
    │   └── users/
    │       ├── hook/
    │       │   ├── index.ts  # orquestrador da página
    │       │   └── types.ts
    │       ├── sections/
    │       │   └── summary/
    │       │       └── index.tsx  # seção
    │       ├── subcomponents/
    │       │   └── userFilters/
    │       │       └── index.tsx  # subcomponente local
    │       ├── tabs/
    │       │   └── details/
    │       │       └── index.tsx  # aba
    │       ├── index.tsx  # página
    │       ├── skeleton.tsx  # skeleton
    │       └── table.tsx  # tabela
    ├── routes/
    │   └── index.tsx  # rotas e proteção
    ├── stores/
    │   ├── system/
    │   │   ├── index.ts  # tema e permissões
    │   │   └── types.ts
    │   └── user/
    │       ├── index.ts  # estado global
    │       └── types.ts  # formato da store
    ├── styles/
    │   ├── theme.ts
    │   └── types.ts
    └── utils/
        ├── functions/
        │   └── index.ts
        ├── types/
        │   └── user/
        │       └── index.ts  # tipos
        ├── validations/
        │   └── user/
        │       └── index.ts
        └── api.ts  # instância HTTP
```

**Global and local scope:**

- **Global:** components and hooks used by more than one page live in `src/components` and `src/hooks`.
- **Local:** what only one page uses lives inside its folder, in `subcomponents/`, with one folder per subcomponent.
- A global component can have its own `subcomponents/`, used only by it.
- Never import something local from another page. Once it is used in more than one place, move it to the global folder.

**Pages:**

- Each page has a `hook/` folder with `index.ts` and `types.ts`. The hook (`useUsersPage`) orchestrates the page: state, API calls, derived values and handlers.
- The page index and its local subcomponents consume that hook instead of drilling state through props. State shared between them lives in a page store or context read by the hook, so all of them see the same value.
- When a page grows, split it as needed into folders such as `tabs/` and `sections/` (or `steps/`, `modals/`), one folder per part, with the same structure as a component. Don't create these folders before you need them.
- `sections/` is only for long pages read top to bottom, split into many titled content blocks that the page index renders in sequence (like the brand guide). Pieces of UI such as forms, cards, lists and modals go in `subcomponents/`, even when they fill a block of the page. A page with only a few blocks uses `subcomponents/`.
- The loading state lives in `skeleton.tsx`, next to the index, not inside the component.
- Columns, formatting and table setup live in `table.tsx`, next to the index.

```tsx
const UsersPage = () => {
  const { isLoading } = useUsersPage()
  if (isLoading) return <UsersSkeleton />
  return <UserFilters />
}

const UserFilters = () => {
  const { filters, handleSearch } = useUsersPage()
  return <SearchInput value={filters.search} onChange={handleSearch} />
}
```

## 3. Naming

- **Identifier language:** English. User-facing copy stays in Portuguese.

| Element | Standard | Example |
| :--- | :--- | :--- |
| Components | PascalCase | `<UserCard />` |
| Functions and hooks | camelCase | `updateUser(), useUserStore()` |
| Variables and props | camelCase | `userId, foundUser` |
| Types and interfaces | PascalCase | `interface UserCardProps {}` |
| Constants and static data | camelCase | `const baseUrl = import.meta.env.VITE_BASEURL` |
| Component folders and files | camelCase | `userCard/` |
| Utility files | camelCase | `userService/index.ts` |
| Folders | camelCase | `validations/` |
| Hooks | prefix `use` + camelCase | `useUserStore` |
| Event handlers | handle prefix | `handleSave` |
| Callback props | prefix `on` | `onSaved` |
| Type prefix | No prefix | `UserCardProps` |
| Booleans | With a verb (is, has, should) | `isActive` |
| Utility organization | Folder + index.ts | `userService/index.ts` |
| Environment variables | SCREAMING_SNAKE with the bundler prefix | `VITE_BASEURL` |

## 4. Components

- **Declaration:** Arrow with typed props. Arrow function with the type on the props.
- **Structure:** Folder with index, styles and types. One component per folder with `index.tsx`, `styles.ts` and `types.ts`.
- **Exports:** Mixed. Default for the file's main component, hook or store and named for types and API functions. One component per file.
- **Props:** always typed in the component's types file.
- **Base components:** @radix-ui/themes.
- **Styles:** Styled Components. Styles in `styles.ts` with access to the theme.
- **Service pages:** open with `ContentNavbar`, never `PageHeader`. Title on the left, the explanation in `info` (shown in the info icon tooltip), and on the right the default reload (`onReload`) plus one text-and-icon button (`action`), or free content in `actions`.
- **Loading a whole page:** use `Loader` with `isCentered`, which shows the logo in the center of the content area.

```text
userCard/
├── index.tsx
├── styles.ts
└── types.ts
```

## 5. State

- **Local:** `useState` for state only the component uses.
- **Global:** Zustand. Small stores, with persistence via middleware.

```typescript
const { user, setUser } = useUserStore()
```

## 6. Data and API

- **API layer:** actions/ folder. API calls grouped by domain in `src/actions/<domain>`. Components and pages never call the HTTP client directly.
- **Requests:** Axios. Instance configured with baseURL and interceptors.
- **Async actions:** useAction hook. A single hook runs the action with pending, success and error toasts and a callback at the end.

```typescript
useAction({
  action: async () => await updateUser(data),
  toastMessages: { pending: 'Salvando...', success: 'Salvo', error: 'Erro ao salvar' },
  callback: () => navigate('/users')
})
```

## 7. Forms

**Zod**. Schemas with inferred types. Submission uses the async action pattern above.

```typescript
const userSchema = z.object({ name: z.string().min(1) })
```

## 8. Code style

- **Imports:** Alias per folder. One alias for each root folder of the project.
- **Import organization:** 3 blocks, longest to shortest. External, internal and `import type`, separated by a blank line and sorted from longest to shortest. Destructuring always on one line.
- **Semicolons:** Semicolons.
- **Quotes:** Double quotes. JSX attributes always use double quotes.
- **Comments:** Zero comments. `//`, `/* */` and JSDoc are forbidden. Code must explain itself.

## 9. Required principles

### Early returns

Validate and exit early, with no nested `if/else`.

✅ Do:
```typescript
if (!user) return manageError({ code: 'not_found' })
return user
```

❌ Don't:
```typescript
if (user) {
  return user
} else {
  return error
}
```

### Immutability

No `let`, `for` or `while`. Use `map`, `filter`, `reduce` and spread.

✅ Do:
```typescript
const names = users.map((user) => user.name)
```

❌ Don't:
```typescript
let names = []
for (const user of users) names.push(user.name)
```

### Strict typing

`any` is forbidden. Types come from schemas and interfaces.

✅ Do:
```typescript
type User = z.infer<typeof userSchema>
```

❌ Don't:
```typescript
const user: any = req.body
```

### Logger instead of console.log

No `console.log` in production. Use the project's logger.

✅ Do:
```typescript
const logger = createLocalLogger('users')
logger.error(error)
```

❌ Don't:
```typescript
console.log(error)
```

### Parallel async

`Promise.all` for calls that do not depend on each other.

✅ Do:
```typescript
const [user, plans] = await Promise.all([findUser(id), listPlans()])
```

❌ Don't:
```typescript
const user = await findUser(id)
const plans = await listPlans()
```

### Don't reinvent utilities

Before writing a helper, look for an equivalent in the project's core.

✅ Do:
```typescript
import { formatDateBR } from '@utils/date'
```

❌ Don't:
```typescript
const format = (d: Date) => d.toLocaleDateString()
```

### Protected private routes

Private routes without a token redirect to sign in.

✅ Do:
```typescript
return privateRoute && !token ? <Navigate to="/signin" /> : element
```

### Permissions per page

Each page declares the permissions it requires, checked by the system store.

✅ Do:
```typescript
const metadata: Partial<LayoutProps> = { requiredPermissions: ['manage_users'] }
```

❌ Don't:
```typescript
if (user.role === 'admin') { ... }
```

### Lazy-loaded routes

Pages load on demand, with code splitting per route.

✅ Do:
```typescript
const UsersPage = lazy(() => import('@pages/users'))
```

### Mobile-first

Styles start from mobile and grow with breakpoints.

✅ Do:
```typescript
padding: 1rem;
@media (min-width: 768px) { padding: 2rem; }
```

❌ Don't:
```typescript
@media (max-width: 768px) { padding: 1rem; }
```

### Accessibility (WCAG)

Semantic elements, labels on icon buttons and visible focus.

✅ Do:
```typescript
<IconButton aria-label="Excluir usuário">
```

❌ Don't:
```typescript
<div onClick={remove}>
```

### Theme colors and spacing

No hard-coded colors or spacing: use the theme.

✅ Do:
```typescript
color: ${({ theme }) => theme.palette.primary.main};
```

❌ Don't:
```typescript
color: #1976d2;
```

### Persisted stores

State that must survive a reload uses the persistence middleware.

✅ Do:
```typescript
create<UserStore>()(persist((set) => ({ ... }), { name: 'user' }))
```

## 10. Tests

- Unit tests are not required.
- E2E tests are not required.
- Before opening a PR, run the linter and the E2E suite in headless mode.

## 11. Commits and Git

Defined in the monorepo guide at the repository root. Follow the rules there.

## 12. Docker and deploy

Defined in the monorepo guide at the repository root. Follow the rules there.

## 13. Publishing

Defined in the monorepo guide at the repository root. Follow the rules there.

## 14. Reference example

Use these files as a template. They follow every rule above.

> Some standards were written by hand. Where the example differs from the sections above, follow the sections.

### `src/components/userCard/index.tsx`

```tsx
import { Button, Typography } from "@mui/material";

import { updateUser } from "@actions/user";
import useAction from "@hooks/useAction";
import { Container } from "./styles";

import type { UserCardProps } from "./types";

const UserCard = ({ userId, name, onSaved }: UserCardProps) => {
  const handleSave = () =>
    useAction({
      action: async () => await updateUser(userId, { name }),
      toastMessages: {
        pending: "Salvando...",
        success: "Salvo com sucesso",
        error: "Erro ao salvar"
      },
      callback: onSaved
    });

  return (
    <Container>
      <Typography variant="h6">{name}</Typography>
      <Button variant="contained" onClick={handleSave}>Salvar</Button>
    </Container>
  );
};

export default UserCard;
```

### `src/components/userCard/styles.ts`

```typescript
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`
```

### `src/components/userCard/types.ts`

```typescript
export interface UserCardProps {
  userId: string;
  name: string;
  onSaved?: () => void;
}
```

### `src/actions/user/index.ts`

```typescript
import api from "@utils/api";

import type { User } from "@utils/types/user";

export const updateUser = async (userId: string, data: Partial<User>) => {
  const response = await api.patch<User>(`/users/${userId}`, data);
  return response.data;
};
```

### `src/stores/user/index.ts`

```typescript
import { persist } from "zustand/middleware";
import { create } from "zustand";

import type { UserStore } from "./types";

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user })
    }),
    { name: "user" }
  )
);

export default useUserStore;
```

### `src/stores/user/types.ts`

```typescript
import type { User } from "@utils/types/user";

export interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}
```

## 15. Checklist before delivering

- [ ] Names follow the naming table and are in English.
- [ ] Files are in the right folder for the architecture.
- [ ] Every `interface` and `type` lives in a `types.ts` file (or `src/utils/types`).
- [ ] `sections/` is used only for long pages of titled blocks; UI pieces are in `subcomponents/`.
- [ ] Local code stays inside its page or component, and shared code lives in the global folders.
- [ ] Components follow "Folder with index, styles and types" and "Arrow with typed props".
- [ ] Props and state are typed, with no `any`.
- [ ] API calls go through "actions/ folder" and use "useAction hook".
- [ ] Styles use Styled Components with theme tokens.
- [ ] Imports follow "Alias per folder".
- [ ] Principle "Early returns" applied.
- [ ] Principle "Immutability" applied.
- [ ] Principle "Strict typing" applied.
- [ ] Principle "Logger instead of console.log" applied.
- [ ] Principle "Parallel async" applied.
- [ ] Principle "Don't reinvent utilities" applied.
- [ ] Principle "Protected private routes" applied.
- [ ] Principle "Permissions per page" applied.
- [ ] Principle "Lazy-loaded routes" applied.
- [ ] Principle "Mobile-first" applied.
- [ ] Principle "Accessibility (WCAG)" applied.
- [ ] Principle "Theme colors and spacing" applied.
- [ ] Principle "Persisted stores" applied.
