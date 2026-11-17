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

Use `theme.brand.*` and `theme.motion.*` for new UI. `theme.palette.*` is the old Radix mapping (mint accent). Do not mix the two on the same screen; when you touch a screen, migrate it to `brand`.

| Role | Token | Use |
| :--- | :--- | :--- |
| Page | `brand.graphite` | App background |
| Card | `brand.surface` | Panels, cards, tables |
| Control | `brand.raised` | Inputs on cards, table headers, active nav item, secondary buttons |
| Border | `brand.border` / `brand.strongBorder` | Dividers / control outlines |
| Text | `brand.steel` | Primary text and the neutral primary button fill |
| Muted text | `brand.steelMuted` | Secondary text, labels, captions (passes 4.5:1 on every surface) |
| Tool fill | `brand.tools[tool].base` | Context fills: primary button, active stroke, chart line |
| Tool text | `brand.tools[tool].text` | Tool-colored text on dark surfaces |
| Tool tint | `brand.tools[tool].soft` | Selected row, active list item, chart area, focus ring |
| Text on tool fill | `brand.tools[tool].contrast` | Label on a tool-colored button |
| States | `brand.states.success / warning / error` (+ `*Text`) | Status only: never for a tool, never decorative |

- **Fonts:** `brand.fonts.display` (Unbounded 800) for page titles, big numbers and section labels; `brand.fonts.body` (Hanken Grotesk) for UI; `brand.fonts.mono` (Space Mono) per principle 3.
- **Spacing:** `theme.spacing(n)` on a 4 px grid. Sections 56 px apart, card padding 24–28 px.
- **Radius:** 10 px on controls, 16 px on panels, 20 px on large cards, pill (`999px`) on badges and chips.
- **Motion:** `motion.fast` for hover and color, `motion.base` for state changes and closing, `motion.expressive` with `easing.snap` for opening. Loader is the symbol's `motion="loop"`.

## 3. Components and their rules

- **Buttons:** variants are primary (steel fill, graphite text), tool (tool fill), secondary (raised fill, strong border), ghost and danger (error outline; solid error only for the final irreversible step). Sizes are 32, 40 and 48 px; 40 px is the default and 44 px is the minimum touch target on mobile. Use one primary per area. Loading keeps the width and swaps the label ("Salvando…"). Icon-only buttons always have an `aria-label`.
- **Fields:** the label goes above the field, help text below and the error below in error text with `aria-invalid`. Focus uses a 2 px border plus a 4 px soft ring, in steel (general) or the tool color (in context). Machine values use the mono font. Prefixes such as `https://` or `/p/` sit in a raised segment inside the field.
- **Selection:**
  - Checkbox, radio and switch always come with a visible label.
  - A switch that is on uses `states.success`.
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
  - Top bar: logo, main nav and API status.
  - Tool tabs are underline tabs; inside a tool the active underline uses the tool color.
  - The side menu groups items by area. "Zona de perigo" is always last and always in error text.
  - Breadcrumbs appear on pages deeper than one level.
- **Overlays:**
  - The backdrop is black at 66%.
  - Dialogs are for confirmation and one-time secrets. A destructive dialog asks the user to type the Project ID before the final button is enabled.
  - Side drawers are for editing a single record.
- **Secrets:** a token is shown once, in the mono font, with a copy button and a warning that it will not appear again. Lists show only the prefix.

## 4. Tool context

The tool is Dados (`data`), Conteúdos (`content`) or Links (`links`); every other screen is `general`. Only these five points change with the context:

1. A 3 px top stroke on the header.
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
| Logo, symbol, app icon, loader, status rivet | `@components/brandMark` (`kind`, `context`, `pose`, `motion`, `status`, `snapKey`) |
| Buttons with icon or loading | `@components/button` |
| Text field with label and error | `@components/input` |
| Multi-line field | `@components/textArea` |
| Card surface (default, dashed, danger, interactive) | `@components/card` |
| Code and JSON | `@components/codeBlock` |
| Empty list or section | `@components/emptyState` |
| Dialog title row | `@components/dialogHeader` |
| Show a secret once | `@components/secretReveal` |
| Top bar and API status | `@components/navbar` |
| Async action with toasts | `@hooks/useAction` |
| Copy with feedback | `@hooks/useClipboard` |

Components shown in the style guide but not built yet (side menu, bulk action bar, command palette, drawer, stat card, chart) are created as global components when the first screen needs them, following this guide.

## 7. Checklist

- [ ] Uses `theme.brand` / `theme.motion` tokens, no hard-coded colors, no mix with `theme.palette` on the same screen.
- [ ] Tool color appears only on the five context points, and only one tool per screen.
- [ ] Machine values in mono; numbers in display.
- [ ] Every state has text or an icon, not color only; contrast 4.5:1 for text.
- [ ] Controls ≥ 40 px (44 px on mobile), visible focus, labels and `aria-label` on icon buttons.
- [ ] Reused a component from the inventory, or added the new one to it.
- [ ] Motion uses `theme.motion` and respects `prefers-reduced-motion`.
