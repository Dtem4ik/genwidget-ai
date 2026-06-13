# GenWidget AI

> AI chat that answers with live React widgets instead of text — floor plans, product
> comparisons, stocks, weather. An extensible generative UI platform built on streaming
> tool-calls. Works with any LLM provider.

[![CI](https://github.com/Dtem4ik/genwidget-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Dtem4ik/genwidget-ai/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Live demo:** [pet1.dtem4ik.dev](https://pet1.dtem4ik.dev)

<!-- TODO(phase 8): hero GIF — apartment cards streaming in with floor plans -->

## What it does

Ask in plain language — get an interactive widget, streamed in as the model generates it:

- "2-bedroom under $200k" → apartment cards with hoverable SVG floor plans
- "compare these two phones" → side-by-side table with advantage highlighting
- "weather in Tel Aviv" → live weather card (Open-Meteo)
- "how is NVDA doing" → price + sparkline

Widgets are skeleton-first: fields fill in as partial JSON arrives, and once the stream
completes they are fully interactive React components whose buttons send follow-up
messages back to the model.

## Stack

Next.js (App Router) · TypeScript strict · Vercel AI SDK · zod · Tailwind + shadcn/ui ·
Vitest + Playwright · GitHub Actions · Vercel

## Architecture

```
user message → /api/chat (streamText + tools) → LLM picks a tool (zod schema)
            → partial tool-call args stream to the client (useChat)
            → widget registry maps toolName → React component
            → skeleton → fields fill in → fully interactive widget
```

Each widget is a self-contained pack — `widgets/<name>/{schema, tool, component,
skeleton, test, fixtures}` — and adding a new domain is a documented 30-minute task
(`docs/adding-a-widget.md`).

## Data sources

For domains with no free real-time API (apartments, products), **the model generates
the listing data itself** as the tool-call arguments — the data is plausible, not real
listings. Genuinely real-time domains (weather, stocks — later phases) use live free
APIs. Photos come from a keyless image host based on a model-provided query. See
[ADR-003](docs/adr/adr-003-llm-generated-data.md).

## Development

```bash
pnpm install
pnpm dev        # dev server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # production build
```

## Status

🚧 Phase 0 — scaffold. Chat core, then widgets, land phase by phase; the commit
history reads as the build log.
