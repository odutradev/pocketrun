# Design guide

This guide defines how the panel looks and behaves: principles, tokens, components and per-tool context. Following it is **mandatory** for any screen, section or component in `ui/`.

**Directive:** before designing or changing UI, read this guide, then look for an existing component in the inventory (section 6) and reuse it. Values live in `src/styles/theme.ts`; this file explains when to use them and never repeats hex codes as the source of truth.

**Visual reference (for people, not rules):** the "PocketRun · Proposta de design" canvas in Claude Design, with the foundations, style guide sheets and reference screens. When the canvas and this file disagree, this file wins.

## 1. Principles

1. **Graphite is the stage.** The panel is dark. Three surface levels separate page, card and control. Use thin borders to separate things; shadows are only for overlays.
2. **Color belongs to the tool.** Outside a tool the panel is neutral (steel on graphite). Inside a tool (Dados, Conteúdos, Links) the tool's color marks only the five context points in section 4.
3. **Mono for what is machine.** Project ID, tokens, document ids, JSON, routes, slugs and code always use the mono font. Human text never does.
4. **State never relies on color alone.** Every status carries an icon or a text label as well as its color.
5. **The pocketknife moves.** Motion comes from the symbol: blades open, close or snap. Respect `prefers-reduced-motion`.

## 2. Tokens

Use `theme.brand.*`, `theme.accent.*`, `theme.radii.*` and `theme.motion.*`. The panel is dark only; there is no light theme and no `theme.palette`. Radix Themes is kept only for primitives (dialog, dropdown menu) and is restyled by `src/styles/global.ts`.

`theme.accent` is the color of the current context: steel on general screens, the tool's colors inside a tool. Use it for the five context points (section 4) and never pick `brand.tools[...]` by hand in a component.

| Role | Token | Use |
| :--- | :--- | :--- |
| Page | `brand.graphite` | App background |
| Card | `brand.surface` | Panels, cards, tables |
| Control | `brand.raised` | Inputs on cards, table headers, active nav item, secondary buttons |
| Border | `brand.border` / `brand.strongBorder` | Dividers / control outlines |
| Text | `brand.steel` | Primary text and the neutral primary button fill |
| Muted text | `brand.steelMuted` | Secondary text, labels, captions (passes 4.5:1 on every surface) |
| Context fill | `accent.base` | Primary button, active stroke, header stroke, chart line |
| Context text | `accent.text` | Context-colored text on dark surfaces (ids, JSON keys) |
| Context tint | `accent.soft` | Selected row, active list item, chart area, focus ring |
| Text on context fill | `accent.contrast` | Label on the primary button |
| States | `brand.states.success / warning / error` (+ `*Text`) | Status only: never for a tool, never decorative |

- **Fonts:** `brand.fonts.display` (Unbounded 800) for page titles, big numbers and section labels; `brand.fonts.body` (Hanken Grotesk) for UI; `brand.fonts.mono` (Space Mono) per principle 3.
- **Spacing:** `theme.spacing(n)` on a 4 px grid. Sections 56 px apart, card padding 24–28 px.
- **Page area:** every panel page uses the same area, owned by `appLayout`'s `Main`: up to `layout.maxWidth` (1280 px), centered, with 16 px side gutters on mobile and 32 px from `md` (top 32/40 px, bottom 64/80 px). A page's root container is `width: 100%` with no `max-width`, padding or margin of its own; only forms or text blocks inside a section may be narrower.
- **Radius:** `radii.tight` (4 px) on side menu items, so the context stroke stays straight; `radii.control` (10 px) on controls, `radii.box` (12 px) on boxes inside cards, `radii.panel` (16 px) on panels, `radii.card` (20 px) on large cards and dialogs, `radii.pill` on badges and chips.
- **Motion:** `motion.fast` for hover and color, `motion.base` for state changes and closing, `motion.expressive` with `easing.snap` for opening. Loader is the symbol's `motion="loop"`. A logo that follows the tool context uses `hasContextTransition` (blades close, swap color, reopen); a logo that is a link uses `isHoverable` (blades spread on hover). The side menu logo uses both, plus `motion="intro"` on first load.

## 3. Components and their rules

- **Buttons:** variants are primary (context fill: steel on general screens, tool color inside a tool), secondary (raised fill, strong border), ghost, danger (error outline) and dangerSolid (only for the final irreversible step, inside `confirmDialog`). Links that look like buttons use `linkButton`. Sizes are 32, 40 and 48 px; 40 px is the default and 44 px is the minimum touch target on mobile. Use one primary per area. Loading keeps the width and swaps the label ("Salvando…"). Icon-only buttons always have an `aria-label`.
- **Fields:** the label goes above the field, help text below and the error below in error text with `aria-invalid`. Focus uses a 2 px border plus a 4 px soft ring, in steel (general) or the tool color (in context). Machine values use the mono font. Prefixes such as `https://` or `/p/` sit in a raised segment inside the field.
- **Selection:**
  - Checkbox, radio and switch always come with a visible label. Settings rows use `switchField`.
  - A switch that is on uses `states.success`.
  - Selects are native (`select`), wrapped in the field frame.
  - Segmented controls handle 2–4 views of the same data.
  - Filter chips are toggle buttons with `aria-pressed`.
- **Feedback:**
  - Inline alerts come in four tones: neutral, success, warning and error.
  - Toasts go bottom right for results of actions.
  - Danger banners go at the top of the page, for system-wide problems such as the API being offline.
  - Skeletons mirror the final layout.
  - Empty states show the closed symbol, one sentence and up to two actions.
- **Badges:** status badges are pills with a dot plus text: Ativo, Publicado, Expira em N dias, Rascunho, Desativado, Revogado. HTTP method tags use the mono font.
- **Data:**
  - Numbers use the display font; raw values use mono.
  - Tables live in a scroll box on small screens.
  - The sorted column is marked with `aria-sort`.
  - A selected row uses a soft tint plus a 3 px inset stroke.
  - Bulk actions appear in a bar while rows are selected.
  - Charts use the tool color with a soft area fill. Other series use neutral steel lines. Every chart has a text `aria-label`.
- **Navigation:**
  - Side menu (`sidebar`): logo on the left and the API status dot (`apiStatus variant="dot"`) on the opposite side, then the panel areas grouped by area with a mono label; the profile link (with sign out) at the bottom. The active item gets the raised fill plus a 3 px left stroke in the context color. Items a role cannot use are hidden. On mobile it becomes a drawer opened from a slim top bar.
  - Tool tabs are underline tabs; inside a tool the active underline uses the tool color.
  - Inside a page, a local side menu groups items by area. "Zona de perigo" is always last and always in error text.
  - Breadcrumbs appear on pages deeper than one level.
- **Overlays:**
  - The backdrop is black at 66%.
  - Dialogs are for confirmation and one-time secrets. A destructive dialog asks the user to type the Project ID before the final button is enabled.
  - Side drawers are for editing a single record.
- **Secrets:** a token is shown once, in the mono font, with a copy button and a warning that it will not appear again. Lists show only the prefix.

## 4. Tool context

The tool is Dados (`data`), Conteúdos (`content`) or Links (`links`); every other screen is `general`. A page declares it in its metadata (`context: "data"`) and `appLayout` provides the matching theme, so components read `theme.accent` and `theme.context`. Only these five points change with the context:

1. A 3 px top stroke on the side menu and on the mobile top bar.
2. The logo: `BrandMark` with `context={tool}`.
3. The active nav item or tab stroke.
4. The primary action button.
5. The focus ring and the selected-item tint.

Text, surfaces, borders and states never change. Never show two tools' colors on one screen. Text color on a tool fill: white on blue, `#21201C` (dark) on brass, graphite on olive (use `tools[tool].contrast`).

## 5. Writing

- User-facing copy is Brazilian Portuguese, short, imperative on buttons ("Criar documento", not "Clique para criar").
- Name things as `.claude/PRODUCT.md` does: aplicação, gestor, token de acesso, coleção, documento, origens permitidas.
- Errors say what happened and what to do next; never show raw codes to the user.

## 6. Inventory

Reuse before creating. Add every new shared component here in the same work.

| Need | Component |
| :--- | :--- |
| Logo, symbol, app icon, status rivet | `@components/brandMark` (`kind`, `context`, `pose`, `motion`, `status`, `snapKey`, `hasContextTransition`, `isHoverable`) |
| Page loader (symbol loop) | `@components/loader` |
| Page shell: side menu, offline banner, tool context | `@components/appLayout` with `@components/sidebar` |
| API status pill, panel line or pulsing dot with tooltip (address and version) | `@components/apiStatus` |
| Page title with eyebrow, description and actions | `@components/pageHeader` |
| Section or panel title (h2) with actions | `@components/sectionHeader` |
| Path on pages deeper than one level | `@components/breadcrumbs` |
| Underline tabs and their panel | `@components/tabNav` + `@components/tabPanel` |
| Tool switcher (Dados, Conteúdos, Links) | `@components/toolSwitcher` |
| Buttons with icon or loading | `@components/button` |
| Link styled as a button | `@components/linkButton` |
| Icon-only button (label required) | `@components/iconButton` |
| Text field with label, hint, error, prefix, mono | `@components/input` |
| Multi-line field | `@components/textArea` |
| Select | `@components/select` |
| Settings row with switch | `@components/switchField` |
| 2–4 views of the same content | `@components/segmentedControl` |
| Custom field (label, hint, error frame) | `@components/formField` |
| Status or info pill | `@components/badge` |
| Token or document validity | `@components/expiryBadge` |
| Card surface (default, dashed, danger, link) | `@components/card` |
| Big number | `@components/statCard` |
| Inline alert or top banner | `@components/alert` |
| Empty list or section | `@components/emptyState` |
| Loading placeholder | `@components/skeleton` |
| Data table with selectable rows | `@components/dataTable` |
| Pagination | `@components/pagination` |
| Dialog | `@components/dialog` |
| Destructive confirmation (typed Project ID) | `@components/confirmDialog` |
| Show a secret once | `@components/secretReveal` |
| Machine value with copy button | `@components/copyField` |
| Code and JSON (highlighted, copyable) | `@components/codeBlock` |
| Text only for screen readers | `@components/visuallyHidden` |
| Async action with toasts | `@hooks/useAction` |
| Copy with feedback | `@hooks/useClipboard` |

Components shown in the style guide but not built yet (bulk action bar, command palette, drawer, chart) are created as global components when the first screen needs them, following this guide.

## 7. Checklist

- [ ] Uses `theme.brand`, `theme.accent`, `theme.radii` and `theme.motion` tokens, no hard-coded colors.
- [ ] Tool color appears only on the five context points, and only one tool per screen.
- [ ] Machine values in mono; numbers in display.
- [ ] Every state has text or an icon, not color only; contrast 4.5:1 for text.
- [ ] Controls ≥ 40 px (44 px on mobile), visible focus, labels and `aria-label` on icon buttons.
- [ ] Reused a component from the inventory, or added the new one to it.
- [ ] Motion uses `theme.motion` and respects `prefers-reduced-motion`.
