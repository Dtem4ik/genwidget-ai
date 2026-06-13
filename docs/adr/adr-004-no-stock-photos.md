# ADR-004: Gradient + icon cards instead of stock photos

Date: 2026-06-13 · Status: accepted

## Context

The data is LLM-generated (ADR-003), so the items are not real — there is no real
photo to show. In phase 3 we tried keyless stock-photo services to fill the card image
slot. They failed on two fronts: relevance (a "Tel Aviv apartment" query returned a
tourist cat statue) and honesty (a random stock photo implies a specific real listing
that doesn't exist).

## Decision

No stock-photo services. The card image slot is a **`DomainCard`**: a theme-aware
gradient with a centered domain icon (Lucide `Home`, `Smartphone`, `Laptop`, `Car`, …,
chosen by category). It is honest (clearly a placeholder, not a real photo), on-brand,
fast, keyless, and looks clean in both themes.

- Gradient uses Tailwind `/opacity` on the `primary` token (our tokens are oklch, so
  `hsl(var(--primary)/…)` does not apply).
- `imageQuery` stays on the schemas for alt text and as the search term if we ever add
  a keyed provider for domains where real photos are genuinely available.

## Consequences

- Real photos return only when we have a real source for a real item (not the case for
  any current widget).
- One shared `DomainCard` + `iconForCategory` serves every widget; new domains get an
  icon by adding one line to the category map.
