# Adding a widget

A widget pack binds one AI tool to one React component. Target effort: ~30 minutes.
Follow the apartments pack (`widgets/apartments/`) as the reference implementation —
this recipe is exactly what it did.

## 1. Create the pack folder

```
widgets/<name>/
  schema.ts             zod input schema + TS types for input/output
  tool.ts               tool({ description, inputSchema, execute })
  component.tsx         renders the tool output
  skeleton.tsx          renders while input streams (receives DeepPartial<Input>)
  component.test.tsx    skeleton / data / error states via ToolWidget
  fixtures.json         2-3 realistic output samples for tests
```

Rules that make packs work well:

- `schema.ts`: every field gets `.describe()` — the model reads these. Spell out
  unit conventions ("price in USD", "area in m²") and enum values.
- `tool.ts`: description says WHEN to use the tool ("Use for ANY question about…")
  and what to generate. **Data pattern (ADR-003): the model generates the content as
  the tool arguments; `execute()` is a zod passthrough — `(input) => input`.** No mock
  catalogs. Live external APIs only for genuinely real-time data (weather, stocks),
  called inside `execute()`.
- `skeleton.tsx`: render placeholder cards that mirror the real card slot-for-slot so
  the layout doesn't shift when data/photos arrive (apartments reserves the photo
  height, spec line, toggle and buttons).
- `component.tsx`: must include an empty state (shared `EmptyState`/`ErrorState` from
  `components/widgets/widget-states.tsx`). Both themes (use theme tokens: `bg-card`,
  `text-muted-foreground`, …) and mobile layout are part of done.
- **Shared primitives (`components/widgets/primitives.tsx`):** render a self-contained
  card through `<WidgetCard>` (it owns the shell classes `w-full p-4 sm:p-5 rounded-xl
border bg-card` — the skeleton must use it too so the two can't drift). Render a
  `{label,value}[]` spec map with `<SpecList>`. Pick the photo-stand-in icon with
  `iconForCategory` from `components/widgets/domain-card.tsx` (gradient + icon, no stock
  photos — ADR-004).
- **Layout:** if the widget renders a list, wrap the items in
  `<WidgetGrid count={items.length}>` — it handles responsive columns. A single-item
  widget renders full-width; design that layout (don't just stretch a narrow card).
- **Accessibility (WCAG 2.1 AA — ADR-006):** decorative icons get `aria-hidden`;
  icon-only buttons get an `aria-label`; streaming skeletons get `aria-busy`; interactive
  controls are keyboard-operable with a visible `focus-visible` ring in both themes;
  contrast ≥ 4.5:1; never rely on color alone (pair red/green with a sign or label).

## 2. Register the tool

In `lib/ai/tools.ts` add one entry:

```ts
export const tools = {
  showApartments,
  yourNewTool, // ← here
} satisfies ToolSet;
```

Types for the client (`ChatTools`, `ChatUIMessage`) update automatically.

## 3. Register the widget

In `components/widgets/registry.tsx` add one entry:

```ts
const registry: Registry = {
  showApartments: { Component: ApartmentResults, Skeleton: ApartmentResultsSkeleton },
  yourNewTool: { Component: YourWidget, Skeleton: YourWidgetSkeleton }, // ← here
};
```

TypeScript enforces that the entry exists and its props match the tool's
input/output. Nothing else needs to change — `ToolWidget` handles the
streaming states (`input-streaming` → skeleton, `output-available` → component,
`output-error` → error card).

## 4. Teach the model

Add one rule line to `SYSTEM_PROMPT` in `app/api/chat/route.ts`: when to call the
tool, and that the widget shows the results (so the model doesn't repeat them as text).

## 5. Test and verify

```
pnpm test        # component states (Vitest)
pnpm typecheck   # registry/props consistency
pnpm e2e         # Playwright happy-path (mocked chat) — see below
pnpm dev         # ask the demo prompt in the chat, check both themes + mobile + keyboard
```

E2E (`e2e/`, Playwright, chromium) never calls the real LLM: `/api/chat` is mocked with
a hand-built UI message stream (`e2e/mock-chat.ts`) so a prompt deterministically renders
a known widget (ADR-006). It runs against the production build, so `pnpm e2e` does
`next build && next start` for you locally. If your widget adds a happy-path worth
locking in, add a spec with role/label selectors (not brittle CSS).

Add the widget's demo prompt to the PR description. Log tool-calling quality
findings (did the model pick the tool? correct args?) in `docs/models.md`.

## Checklist (DoD per widget)

- [ ] skeleton + data + empty + error states
- [ ] light + dark themes, mobile layout (no horizontal overflow at 375px, 44px tap targets)
- [ ] accessible: keyboard-operable, focus-visible ring, decorative icons `aria-hidden`,
      `aria-busy` skeleton, contrast ≥ 4.5:1, not color-only (ADR-006)
- [ ] component test covering skeleton / data / error
- [ ] `execute()` is a zod passthrough (or a live real-time API call); no mock catalog
- [ ] system prompt rule added; demo prompt verified end-to-end
