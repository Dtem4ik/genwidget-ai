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

**Data pattern (ADR-003): the LLM generates content as the tool-call arguments;
`execute()` is a zod-validated passthrough that returns the args.** No mock catalogs,
no external content API. Live external APIs are reserved for genuinely real-time data
(weather, stocks — later phases). Widget photos use a keyless image host built from an
LLM-provided `imageQuery` field.

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

Phases 0–3 done and on prod (pet1.dtem4ik.dev). Apartments widget: LLM-generated
listings with photos and floor plans. Next: phase 4 (compare + recommend widgets).
