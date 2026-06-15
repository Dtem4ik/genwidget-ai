# ADR-006: Accessibility target and deterministic E2E strategy

Date: 2026-06-15 · Status: accepted

## Context

The app was functional and tested at the component level (Vitest), but had two gaps
for a production-grade portfolio piece:

1. **Accessibility** was never audited end-to-end. A recruiter or engineer evaluating
   the code (or a screen-reader / keyboard user) should find it polished.
2. **No end-to-end coverage.** The streaming chat → tool-call → widget loop — the core
   of the product — was only exercised by hand. We need automated proof it works, but
   the chat depends on a free-tier LLM (`gemini-3.1-flash-lite`, ~500 req/day) that is
   flaky, rate-limited, and non-deterministic. Calling it from CI would make the suite
   slow, flaky, and quota-burning.

## Decision

**Accessibility target: WCAG 2.1 AA.** Concretely, across chat and all 6 widgets:
keyboard operability with a visible `focus-visible` ring in both themes; decorative
Lucide icons marked `aria-hidden`; accessible names on icon-only controls and the chat
input; `role="status"`/`role="alert"` live regions for the thinking indicator and
errors (the conversation log is already `role="log"`); `aria-busy` on streaming
skeletons; `aria-pressed` + a labelled group for filter chips; text contrast ≥ 4.5:1
(trend deltas bumped to the 700 shade, caption opacity dropped); and trend is never
color-only (a `+`/`−` sign and an sr-only "Up/Down" accompany the red/green).

**E2E mocks the LLM; it never calls the real model.** `POST /api/chat` is intercepted
in Playwright and fulfilled with a hand-built **AI SDK v6 UI message stream** (SSE
`data:` chunks — `tool-input-available` → `tool-output-available` → `finish`, chunk
types verified against `node_modules/ai`). `useChat` parses it exactly as it would a
real response and renders a real widget. This makes the suite:

- **deterministic** — a prompt always yields the same tool-call + widget;
- **free** — zero quota burned, no network to the model;
- **fast & reproducible in CI**.

The API-free landing auto-demo is the other deterministic surface and is asserted to
make **zero** `/api/chat` requests.

**Playwright runs chromium-only, against the production build.** CI installs only
chromium (`--with-deps`) and caches the browser binaries keyed on the Playwright
version. Tests run against `next build && next start` (in CI the build is a separate
pipeline step the e2e server reuses) so they mirror prod, with no dev overlays. Upstash
is intentionally **not** configured in CI, so rate-limit/cache no-op — e2e passes
without it.

New dev dependency: `@playwright/test`.

## Consequences

- CI pipeline is now: install → lint → format → typecheck → vitest → build → e2e, with
  the HTML report uploaded as an artifact on failure.
- The mock encodes the AI SDK wire format by hand, so a future major AI SDK bump could
  require updating `e2e/mock-chat.ts` (the chunk types are pinned to a comment there).
- Accessibility is now part of the per-widget DoD (see `docs/adding-a-widget.md`) so new
  widgets don't regress it.
- Selectors are role/label-based, which both keeps e2e resilient and continuously
  exercises the accessible names added in the a11y pass.
