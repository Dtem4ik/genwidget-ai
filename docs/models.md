# Models

Free-tier only ($0/mo). Provider/model switching is one line in `lib/ai/provider.ts`
or the `AI_CHAT_MODEL` env var. This file tracks what we actually verified, with dates —
free tiers change without notice.

## Current default: `gemini-2.5-flash` (Google AI Studio free tier)

Verified 2026-06-12 with a real free-tier key:

| Model                    | Status on free tier  | Notes                                                          |
| ------------------------ | -------------------- | -------------------------------------------------------------- |
| `gemini-2.5-flash`       | ✅ works, fast       | **default** — stable under load                                |
| `gemini-3.5-flash`       | ⚠️ 503 "high demand" | newest flash; retry later, likely capacity-gated for free tier |
| `gemini-flash-latest`    | ⚠️ 503 "high demand" | alias currently points at a 3.x model                          |
| `gemini-3-flash-preview` | ⚠️ timeouts          | preview models have tighter free limits                        |

Free-tier limits for 2.5 Flash as commonly reported (verify in
[AI Studio rate-limit view](https://aistudio.google.com/rate-limit) for the exact
project — Google stopped publishing fixed numbers in docs):

- ~10 RPM, ~250k TPM, up to ~1,500 RPD (resets midnight Pacific)
- Limits are per project, not per key
- Free-tier requests may be used by Google to improve models — fine for this demo,
  do not send anything private

### Tool-calling quality (verified 2026-06-13, phase 2)

`gemini-2.5-flash` with `searchApartments` (4 optional filter args):

- "show me 2-bedroom apartments under $200k" → correct call on the first try:
  `{rooms: 2, maxPrice: 200000}`; one short text comment after the widget,
  no listing data repeated as text (system prompt rule respected)
- Partial-args streaming works: filter chips appear in the skeleton while the
  JSON is still streaming
- No few-shot needed so far — `.describe()` on every schema field plus an
  explicit "Use for ANY question about…" tool description was enough
- Re-verify when adding tools with overlapping domains (phase 4: compare vs
  recommend) — that's where flash models usually start picking wrong tools

## Fallback queue (not yet wired)

1. **Groq** (`@ai-sdk/groq`) — free tier, very fast inference; check tool-call quality
2. **OpenRouter free models** (`@openrouter/ai-sdk-provider`) — last resort, model pool
   changes frequently

Each fallback gets a row in the table above when we actually test it, not before.
