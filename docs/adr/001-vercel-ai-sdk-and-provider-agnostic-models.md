# ADR-001: Vercel AI SDK with provider-agnostic free-tier models

Date: 2026-06-12 · Status: accepted

## Context

The core of GenWidget AI is a chat that streams tool-calls into React widgets. We need
a streaming layer that: (1) streams partial tool-call arguments so widgets can render
skeleton-first, (2) is not locked to one LLM vendor — the budget is $0/mo, so we must
be able to hop between free tiers (Gemini → Groq → OpenRouter) without rewrites,
(3) is the de-facto standard in the React/Next.js ecosystem this portfolio targets.

## Decision

- **Vercel AI SDK** (`ai` v6) for both server (`streamText`, tool definitions with zod)
  and client (`useChat` from `@ai-sdk/react`). It streams partial JSON for tool-call
  args with explicit part states (`input-streaming` → `input-available` →
  `output-available`/`output-error`) — exactly the widget lifecycle we need in phase 2.
- **Provider isolated in `lib/ai/provider.ts`**: a single module exports the chat model;
  switching provider or model is a one-line change or an `AI_CHAT_MODEL` env override.
- **Default model: `gemini-2.5-flash`** via `@ai-sdk/google` (AI Studio free tier).
  Model choice and free-tier limits are tracked in [docs/models.md](../models.md).
- **AI Elements** (shadcn registry, vendored into `components/ai-elements/`) as chat UI
  primitives — they are source-owned, not a dependency, and require the Radix base we
  initialized shadcn with. Markdown streaming renders via `streamdown` (brought in by
  AI Elements), which handles incomplete markdown without layout jumps.

## Alternatives considered

- **Direct provider SDKs** (`@google/genai` etc.) — locks us in; partial tool-call
  streaming and UI message protocol would have to be hand-rolled.
- **LangChain.js** — heavier abstraction, weaker typed tool-call streaming for UI,
  not the standard for frontend-focused roles.
- **Prebuilt chat templates** (ai-chatbot) — rejected for the whole project: this repo
  must demonstrate our own architecture, not a forked template.

## Consequences

- Provider hops are cheap by design; we verify each provider's tool-calling quality
  in docs/models.md before relying on it (phase 2+).
- We own AI Elements source: registry updates do not auto-apply, upgrades are manual
  diffs — acceptable for a showcase repo.
