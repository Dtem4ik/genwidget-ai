# genwidget-ai — agent guide

@AGENTS.md

## What this is

Generative UI showcase: chat → streaming tool-calls → React widgets. The AI answers
with live widgets (apartment cards with floor plans, product comparisons, weather,
stocks) instead of text. Demo at pet1.dtem4ik.dev.

## Commands

- `pnpm dev` — dev server
- `pnpm lint` — eslint
- `pnpm typecheck` — tsc --noEmit
- `pnpm format` / `pnpm format:check` — prettier
- `pnpm build` — production build
- `pnpm test` — vitest (component tests)
- `pnpm e2e` — playwright (from phase 7)

## Architecture

`app/api/chat` → `streamText` + tools (`lib/ai/tools.ts`) → widget registry
(`components/widgets/registry.tsx`) → `widgets/<name>/` modules. Each widget is a
self-contained module:
`widgets/<name>/{schema.ts, tool.ts, component.tsx, skeleton.tsx, *.test.tsx, fixtures.json}`.

Tools wired today: `showApartments`, `compareProducts`, `recommendProduct`, `getWeather`,
`getStockOrCrypto`, `setFilters`. The two live-data tools (`getWeather`,
`getStockOrCrypto`) have a real `execute()` that fetches a free keyless API with an 8s
`AbortSignal` timeout and returns `{ error }` on failure; the rest are zod passthroughs.

**Data pattern (ADR-003): the LLM generates content as the tool-call arguments;
`execute()` is a zod-validated passthrough that returns the args.** No mock catalogs,
no external content API. Live external APIs are reserved for genuinely real-time data
(weather, stocks — later phases).

**Responsive layout:** list-rendering widgets wrap their items in
`<WidgetGrid count={n}>` (`components/widgets/WidgetGrid.tsx`) — it maps item count to
the column layout (1 → full width, 2 → two cols, 3+ → three), always single-column on
mobile. Widgets don't manage their own grid positioning. Single-item widgets render
full-width with a layout designed for it (hero / horizontal).

**No stock photos (ADR-004):** the image slot is a shared `DomainCard` — a theme
gradient + Lucide icon (`iconForCategory`, icon scales with card size). `imageQuery`
stays on schemas for alt text.

**Spec maps:** use an array of `{label, value}`, NOT `z.record()` — Gemini
function-calling rejects JSON-schema `additionalProperties` (400).

**Widget → chat loop:** `WidgetActionsProvider` (in `chat.tsx`) exposes `useWidgetActions().ask(text)`
so widget buttons can send follow-up turns.

Models are free-tier only (default `gemini-3.1-flash-lite`; → Groq → OpenRouter free);
switching providers is a one-line change in `lib/ai/provider.ts`. See `docs/models.md`.

## Rules

- TypeScript strict; no `any`
- Every widget ships with: skeleton + error + mobile states, light + dark theme,
  component test covering 3 states (skeleton / data / error)
- New dependencies require an ADR in `docs/adr/`
- Conventional commits (feat/fix/docs/refactor/test/chore/ci/perf), enforced by commitlint
- Never commit API keys; document env vars in `.env.example`
- MVP scope is locked at 6 widgets — new domains go to the roadmap in the plan, not the code

## How to add a widget

See `docs/adding-a-widget.md` — follow it exactly. Reference implementation:
`widgets/apartments/` (showApartments tool + ApartmentResults widget): photos,
collapsible floor plans, staggered entrance animation.

## Status

Phases 0–6 done and on prod (pet1.dtem4ik.dev). **All 6 MVP widgets live**:
ApartmentResults, CompareTable, ProductRecommendation (LLM-generated), WeatherCard
(Open-Meteo), StockCard (CoinGecko/Yahoo), FilterChips (model-controlled UI state).
Shared EmptyState/ErrorState; widget buttons loop back into the chat.

**Economics (phase 6, ADR-005):** auto-demo replay on landing (no API,
`hooks/useDemoReplay.ts`), per-IP rate limit 10/day (`lib/rate-limit.ts`, Upstash),
bring-your-own-key (`x-byok-key`, localStorage), response cache for suggested prompts
(`lib/cache.ts`, 24h). Upstash Redis is optional — features no-op without
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`; rate-limit also off in dev.
