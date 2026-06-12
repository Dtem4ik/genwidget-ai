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
- `pnpm test` — vitest (from phase 2)
- `pnpm e2e` — playwright (from phase 7)

## Architecture

`app/api/chat` → `streamText` + tools (`lib/ai/tools.ts`) → widget registry
(`components/widgets/registry.tsx`) → `widgets/<name>/` modules. Mock catalogs
live in `data/*.json`. Each widget is a self-contained module:
`widgets/<name>/{schema.ts, tool.ts, component.tsx, skeleton.tsx, component.test.tsx, fixtures.json}`.

Models are free-tier only (Gemini Flash → Groq → OpenRouter free); switching
providers is a config change, never a rewrite.

## Rules

- TypeScript strict; no `any`
- Every widget ships with: skeleton + error + mobile states, light + dark theme,
  component test covering 3 states (skeleton / data / error)
- New dependencies require an ADR in `docs/adr/`
- Conventional commits (feat/fix/docs/refactor/test/chore/ci/perf), enforced by commitlint
- Never commit API keys; document env vars in `.env.example`
- MVP scope is locked at 6 widgets — new domains go to the roadmap in the plan, not the code

## How to add a widget

See `docs/adding-a-widget.md` (lands in phase 2) — follow it exactly.
