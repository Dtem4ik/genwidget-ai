# Changelog

## v1.0.0 — MVP complete (2026-06-15)

The full MVP: an extensible generative-UI chat where the model answers with live,
streaming React widgets, shipped on prod at [pet1.dtem4ik.dev](https://pet1.dtem4ik.dev)
at **$0/mo**, accessible, and end-to-end tested.

### Highlights

- **6 live widgets** — `ApartmentResults` (with floor plans), `CompareTable`,
  `ProductRecommendation`, `WeatherCard` (Open-Meteo), `StockCard` (CoinGecko/Yahoo),
  `FilterChips`.
- **Streaming generative UI** — the model streams tool-call arguments as partial JSON;
  the widget registry renders skeleton → data → interactive. Widget buttons loop back
  into the chat (UI → AI → UI).
- **LLM-as-data pattern (ADR-003)** — content is generated as tool arguments;
  `execute()` is a zod passthrough. Live free APIs only for real-time domains.
- **$0/mo (ADR-005)** — auto-demo replay, per-IP rate limit, bring-your-own-key, and a
  24h response cache (Upstash, optional).
- **Accessible (WCAG 2.1 AA, ADR-006)** + light/dark themes + 375px mobile.
- **Deterministic Playwright e2e** that mocks the LLM, plus Vitest component tests, all
  green in CI (lint → format → typecheck → vitest → build → e2e).
- **Provider-agnostic** free-tier models (ADR-001); no stock photos (ADR-004).

### Phase history

- **0** — scaffold: Next.js 16 App Router, TS strict, Tailwind v4 + shadcn, themes, CI.
- **1** — streaming chat core (Vercel AI SDK, `useChat`).
- **2** — first widget pack (`showApartments`) + registry/tools extension points.
- **3** — floor plans + the LLM-generated-data pivot (ADR-003).
- **4** — `CompareTable` + `ProductRecommendation`, `DomainCard` (no stock photos, ADR-004),
  the UI → AI → UI loop.
- **5 / 5b** — live-API widgets (weather, stock, filters); responsive `WidgetGrid` and
  full-width layouts. All 6 MVP widgets live.
- **6** — economics: rate-limit, auto-demo, BYOK, cache (ADR-005).
- **7** — quality pass: a11y, mobile, deterministic Playwright e2e + CI, shared widget
  primitives (ADR-006).
- **8** — packaging: README front door, architecture diagram, generated screenshots,
  ADR index, repo metadata, this release.

### Next

Runs natively inside Claude as an **MCP App** (planned) — the same widgets rendered in
Claude / Claude Desktop via `ui://` resources.
