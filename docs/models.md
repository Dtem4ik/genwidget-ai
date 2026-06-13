# Models

Free-tier only ($0/mo). Provider/model switching is one line in `lib/ai/provider.ts`
or the `AI_CHAT_MODEL` env var. This file tracks what we actually verified, with dates —
free tiers change without notice.

## Current default: `gemini-3.1-flash-lite` (Google AI Studio free tier)

Switched 2026-06-13: `gemini-2.5-flash` free-tier RPD had dropped to ~20/day (nearly
maxed). `gemini-3.1-flash-lite` gives ~25× the daily headroom and, in testing,
generates better-varied content. Limits (per project, per AI Studio): **15 RPM /
250K TPM / 500 RPD**.

| Model                    | Status on free tier  | Notes                                               |
| ------------------------ | -------------------- | --------------------------------------------------- |
| `gemini-3.1-flash-lite`  | ✅ works, fast       | **default** — 500 RPD; varied, contextual tool args |
| `gemini-2.5-flash`       | ✅ works             | prior default; free-tier RPD shrank to ~20/day      |
| `gemini-3.5-flash`       | ⚠️ 503 "high demand" | capacity-gated on free tier (2026-06-12)            |
| `gemini-flash-latest`    | ⚠️ 503 "high demand" | alias points at a 3.x model                         |
| `gemini-3-flash-preview` | ⚠️ timeouts          | preview models have tighter free limits             |

Notes:

- Limits are per project, not per key
- Free-tier requests may be used by Google to improve models — fine for this demo,
  do not send anything private

### Tool-calling quality — `gemini-3.1-flash-lite` (verified 2026-06-13)

"Show me 2 two-bedroom apartments in Tel Aviv under 400k USD" → fires the apartments
tool first try and generates an array of contextually distinct listings, each with a
sharp `imageQuery` (e.g. "modern 2 bedroom apartment Tel Aviv interior", "renovated
apartment Tel Aviv balcony"). Noticeably more varied than 2.5-flash, which tended to
repeat the same `imageQuery` across items. No few-shot needed.

### History — `gemini-2.5-flash` (phase 2, 2026-06-13)

When the apartments tool was catalog-backed (`searchApartments`, filter args),
2.5-flash picked the tool and `{rooms, maxPrice}` correctly first try. Re-verify
tool selection when adding overlapping domains (phase 4: compare vs recommend) —
that's where flash models start picking the wrong tool.

## Fallback queue (not yet wired)

1. **Groq** (`@ai-sdk/groq`) — free tier, very fast inference; check tool-call quality
2. **OpenRouter free models** (`@openrouter/ai-sdk-provider`) — last resort, model pool
   changes frequently

Each fallback gets a row in the table above when we actually test it, not before.
