# ADR-005: $0/mo cost strategy

Date: 2026-06-14 · Status: accepted

## Context

This is a public, unauthenticated recruiter demo on a free-tier model
(`gemini-3.1-flash-lite`, ~500 requests/day total for the whole project). It must stay
at **$0/mo** no matter the traffic, while still feeling instant and magical to a
first-time visitor. A single curious visitor (or a bot) must not be able to exhaust the
day's quota and break the demo for everyone else.

## Decision

Four layers, cheapest-first:

1. **Auto-demo replay on landing** (`hooks/useDemoReplay.ts`) — a scripted
   apartments + weather scenario plays from hardcoded data with **zero API calls**.
   Most visitors see the "wow" without ever hitting the model.
2. **Per-IP rate limit** (`lib/rate-limit.ts`, Upstash Redis) — 10 messages/day/IP via
   a fixed window. Caps the blast radius of any single visitor against the 500/day pool.
3. **Bring-your-own-key** (`components/chat/BYOKBanner.tsx`) — past the limit, a visitor
   can paste their own free Google AI Studio key. It lives only in their browser
   (localStorage), is sent per-request via `x-byok-key`, runs on their quota, and skips
   our rate limit. Never logged.
4. **Response cache for suggested prompts** (`lib/cache.ts`, Upstash Redis, 24h TTL) —
   the 3 LLM-generated suggested prompts are cached and replayed instantly, so the most
   common first interactions cost one generation per day, not one per visitor.

Live-data tools (weather, stocks) are **never cached** — they must stay real-time.

## Consequences

- Graceful degradation: without Upstash configured (local dev, CI), rate-limit and cache
  silently no-op; the app still works. Rate-limit is also off in `NODE_ENV=development`.
- Two free-tier deps added (`@upstash/ratelimit`, `@upstash/redis`) — both free here.
- The demo + cache mean the model is barely touched in normal browsing; the 500/day pool
  comfortably covers real interactions, and BYOK is the escape hatch past that.
