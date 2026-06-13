# GenWidget AI

> **AI chat that answers with live, interactive React widgets instead of walls of text.**
> Ask for apartments, compare phones, get a product recommendation — the model streams
> structured data through tool-calls and the UI renders it as a real widget.

[![CI](https://github.com/Dtem4ik/genwidget-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Dtem4ik/genwidget-ai/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](tsconfig.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Live demo → [pet1.dtem4ik.dev](https://pet1.dtem4ik.dev)**

![Demo](docs/demo.gif)

<!-- TODO: record demo GIF after Phase 5 -->

## What makes this different

- 🏗️ **A widget platform, not a toy demo** — domains ship as self-contained packs; adding a new one is a ~30-minute task by design.
- 🔄 **Streaming tool-calls** — watch a widget's fields fill in as the model generates them, not a spinner then a text dump.
- 🧩 **LLM as the data source** — the model generates realistic content as the tool arguments; `execute()` just validates with zod. No catalogs to maintain.
- 🔁 **Widgets talk back** — buttons inside a widget send follow-up turns into the chat, so the widget is part of the conversation (UI → AI → UI).
- 🎨 **No fake photos** — gradient cards with domain icons instead of misleading stock images (honest and clean).
- 🌗 **Light + dark theme** on every widget, plus mobile layouts.
- 🔌 **Provider-agnostic** — switch the model in one line; runs on free-tier Gemini today.

## Try it

Open **[pet1.dtem4ik.dev](https://pet1.dtem4ik.dev)** and paste any of these:

- `2-bedroom apartments in Tel Aviv under $400k`
- `compare iPhone 15 Pro vs Pixel 9 vs Galaxy S25`
- `best laptop under $1500 for a developer`

## Widgets

| Widget                | Domain      | Data           | Status     |
| --------------------- | ----------- | -------------- | ---------- |
| ApartmentResults      | Real estate | LLM-generated  | ✅ Live    |
| CompareTable          | Any product | LLM-generated  | ✅ Live    |
| ProductRecommendation | Any product | LLM-generated  | ✅ Live    |
| WeatherCard           | Weather     | Open-Meteo API | 🚧 Phase 5 |
| StockCard             | Finance     | Free API       | 🚧 Phase 5 |
| FilterChips           | UI state    | LLM-generated  | 🚧 Phase 5 |

## Architecture

```
user message
  └─> /api/chat (streamText + tools)
        └─> LLM picks a tool and streams its arguments (zod schema)
              └─> useChat() on the client receives message.parts
                    └─> widget registry maps toolName -> React component
                          └─> skeleton -> fields fill in -> interactive widget
                                └─> widget buttons send a new turn back to the model
```

**Data pattern ([ADR-003](docs/adr/adr-003-llm-generated-data.md)):** for domains with no
free real-time API, the model generates the data as the tool-call arguments and
`execute()` is a zod-validated passthrough. Genuinely real-time domains (weather,
stocks) use live free APIs. No stock photos — gradient + icon
([ADR-004](docs/adr/adr-004-no-stock-photos.md)).

## Adding a widget

New domain? See **[docs/adding-a-widget.md](docs/adding-a-widget.md)** — it's a 30-minute
task by design: schema → tool → component → one registry entry.

## Stack

Next.js · TypeScript (strict) · Vercel AI SDK · zod · Tailwind · shadcn/ui · motion ·
Vitest · Gemini (free tier) · deployed on Vercel.

## Development

```bash
pnpm install
pnpm dev        # dev server
pnpm test       # vitest
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # production build
```

Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` (see `.env.example`).
