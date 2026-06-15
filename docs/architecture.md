# Architecture

GenWidget AI turns a chat turn into a **streaming, interactive React widget**. The model
never returns the widget — it returns _structured arguments_ for a tool, and the client
maps that tool to a component that renders as the data streams in.

## The request → widget flow

```mermaid
flowchart TD
    U["User message"] --> API["/api/chat<br/>streamText + tools"]
    API --> LLM["LLM picks a tool<br/>and streams its arguments<br/>(zod schema, partial JSON)"]
    LLM --> EX{"execute()"}
    EX -- "LLM-generated domains<br/>(apartments, compare, recommend, filters)" --> PASS["zod passthrough<br/>(args = the data) · ADR-003"]
    EX -- "real-time domains<br/>(weather, stocks)" --> LIVE["fetch a free keyless API<br/>(8s AbortSignal timeout)"]
    PASS --> STREAM["AI SDK streams message.parts<br/>(tool-input → tool-output)"]
    LIVE --> STREAM
    STREAM --> UC["useChat() on the client"]
    UC --> REG["widget registry<br/>toolName → { Component, Skeleton }"]
    REG --> W["Widget renders by state:<br/>skeleton → fields fill in → interactive"]
    W -- "button → ask(text) → sendMessage" --> U
```

The widget → chat arrow is the **UI → AI → UI loop**: buttons inside a widget
(`Tell me more`, `Something cheaper`, filter `Apply`) send a follow-up turn back into the
chat via `useWidgetActions().ask()`, so the widget is part of the conversation, not a dead end.

## Streaming states

Each tool part moves through states the registry renders directly (`ToolWidget`):

| AI SDK part state                     | What renders                           |
| ------------------------------------- | -------------------------------------- |
| `input-streaming` / `input-available` | the widget **skeleton** (shell parity) |
| `output-available`                    | the **widget component** with data     |
| `output-error`                        | the shared **error card**              |

Because the skeleton and the loaded card render through the same shell
(`WidgetCard`, `components/widgets/primitives.tsx`), nothing shifts size when data swaps in.

## Adding a domain

A widget is a self-contained pack — `widgets/<name>/{schema, tool, component, skeleton,
test, fixtures}` — plus one line in `lib/ai/tools.ts` and one in
`components/widgets/registry.tsx`. TypeScript correlates the tool's input/output with its
component. See [adding-a-widget.md](adding-a-widget.md). Target: ~30 minutes.

## Staying free ($0/mo)

Four cheapest-first layers keep the public demo at $0 regardless of traffic
([ADR-005](adr/adr-005-cost-strategy.md)):

```mermaid
flowchart LR
    V["Visitor"] --> D["1 · Auto-demo replay<br/>(scripted, no API)"]
    D --> RL["2 · Rate limit<br/>10/day/IP (Upstash)"]
    RL --> BYOK["3 · Bring-your-own-key<br/>(localStorage, their quota)"]
    BYOK --> C["4 · Response cache<br/>suggested prompts, 24h"]
    C --> M["Free-tier LLM<br/>(gemini-3.1-flash-lite, ~500/day)"]
```

Live-data tools (weather, stocks) are never cached — they must stay real-time. Rate-limit
and cache no-op gracefully when Upstash isn't configured (local dev, CI).
