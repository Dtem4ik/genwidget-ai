# ADR-003: LLM-generated data instead of mock catalogs

Date: 2026-06-13 · Status: accepted (supersedes the phase-2 mock catalog)

## Context

Phase 2 backed the apartments widget with a static `data/apartments.json` catalog
(40 items, two fictional complexes) and SVG floor-plan polygons. Two problems:

- A fixed catalog can't answer "apartments in Tel Aviv" — it only knows its own
  invented complexes. The demo's wow factor is answering _any_ domain query, live.
- There is no free real-estate API at $0/mo, and maintaining hand-written catalogs
  for every future domain (cars, laptops, …) does not scale.

## Decision

The LLM generates the content **as the tool-call arguments**; `execute()` is a
zod-validated passthrough that returns the args unchanged. No catalog, no external
content API.

- `showApartments` (was `searchApartments`): input schema is the apartment array the
  model fills in; `execute: (input) => input`.
- Per-listing `imageQuery` lets the model pick a fitting photo; the frontend builds a
  keyless image URL from it.
- Live external APIs stay reserved for genuinely real-time data (weather, stocks in
  later phases) — those are _not_ LLM-generated.

## Consequences

- "Apartments in Tel Aviv under $400k" returns real Tel Aviv neighbourhoods with
  plausible prices and matching photos — generated on demand.
- Data is plausible, not real listings. **The README states this honestly.**
- Adding a domain is now purely a schema + component task; no data sourcing.
- Quality depends on the model. `gemini-3.1-flash-lite` generates varied, sensible
  listings (see docs/models.md). Validation is the zod schema in the tool.

## Notes

- Photos: `source.unsplash.com` (planned) was shut down in 2024 and Pollinations now
  charges, so photos use LoremFlickr (keyless) with curated interior tags + a per-card
  lock for relevance and variety. `imageQuery` is retained on the schema for the alt
  text and for a future upgrade to a keyed provider (e.g. Unsplash API).
- Floor plans: 5 curated SVGs in `public/floorplans/`, chosen by room count — the
  phase-2 per-apartment polygon spec was dropped with the catalog.
