# PokéVault — AI Agent Context

## Product Vision

PokéVault is a production-ready Pokémon TCG portfolio platform for serious collectors. Track card valuations, manage holdings with grading data, organize virtual binders, monitor market trends, and plan collection goals — all in a premium, mobile-first dark UI.

## Architecture

| Layer | Current | Target |
|-------|---------|--------|
| Framework | Vite 6 SPA | Next.js App Router |
| UI | React 19 + Tailwind v4 + Motion | Same |
| Data | Supabase (PostgreSQL + Auth + Storage) | Same |
| Server State | Custom hooks + localStorage cache | TanStack Query |
| Card Data | Pokemon TCG API v2 (client-side fetch) | Server-side with cache |
| AI | @google/genai (Gemini) | Same, server-side only |
| Types | `src/types.ts` (7 interfaces, 4 unions) | Shared `types/` package |

### Supabase Tables (10)

`profiles` · `cards` · `collection_items` · `wishlist_items` · `binders` · `goals` · `market_prices` · `price_history` · `price_notifications` · `price_alerts`

### Key Files

- `src/App.tsx` (782 lines) — god component, all state + routing
- `src/services/supabase.service.ts` (792 lines) — god service, all DB ops
- `src/services/pokemonTcg.service.ts` — Pokemon TCG API client
- `src/types.ts` — Card, CollectionItem, WishlistItem, Binder, PriceSnapshot, PriceNotification, CollectionGoal
- `src/index.css` — Tailwind v4 theme tokens, custom utilities

### Critical God Components (>1000 lines)

| File | Lines | Issue |
|------|-------|-------|
| `LandingPage.tsx` | 2800+ | Marketing + auth + animations |
| `CardDetailsModal.tsx` | 2500+ | View + edit + price + photos |
| `JourneyTab.tsx` | 2000+ | Timeline + achievements + story |
| `TrainerLabTab.tsx` | 1900+ | 4 tools in one component |
| `SettingsTab.tsx` | 1700+ | All settings + LGPD + profile |

## Business Rules

1. **Collection** — Each `CollectionItem` links to a `Card` via `cardId`. Supports multiple copies of the same card with different grades, conditions, and purchase data.
2. **Valuation** — Market price from Pokemon TCG API `tcgplayer.prices`. Priority: `holofoil.market` → `reverseHolofoil.market` → `normal.market` → `normal.mid`. ROI = `(currentPrice - purchasePrice) / purchasePrice`.
3. **Grading** — `GradeType`: Raw, PSA, CGC, BGS. `gradeValue` is `number | string` (e.g. 10, 9.5, "Authentic"). Graded cards use market price multipliers.
4. **Quality** — `CardQuality`: M (Mint), NM (Near Mint), SP (Slightly Played), MP (Moderately Played), HP (Heavily Played), D (Damaged).
5. **Language** — Cards tracked in `CardLanguage`: BR (Portuguese), EN (English), JP (Japanese). Prices vary by language market.
6. **Currency** — Display in USD, EUR, BRL, JPY. Stored in USD, converted at display time.
7. **Goals** — `GoalType`: `set` (complete a set), `master_set` (all variants), `pokemon` (all cards of a species), `value` (portfolio target value).
8. **Wishlist** — Target price + priority (High/Medium/Low). Price alerts when market price drops below target.
9. **Binders** — Virtual organization. Cards can belong to one binder. Cover card is any owned card.

## Coding Standards

- **TypeScript strict mode**, no `any`, no `as` casts without justification
- **Components ≤ 300 lines** — split into composable units
- **Server Components by default** — `'use client'` only for interactivity
- **TanStack Query** for all server state — no raw `useState` + `useEffect` for data
- **Supabase via typed client** — generated types from schema
- **Named exports only** — no default exports
- **Barrel exports** via `index.ts` per feature directory
- **Error boundaries** on every route segment
- **Tests required** — Vitest + RTL for logic/components, Playwright for E2E
- **No hardcoded credentials** — env vars via `.env.local`, server-side only

## UI Principles

- **Dark theme** — vault-dark palette (`slate-850: #1b202c`, `slate-750: #222938`)
- **Glassmorphism** — `backdrop-blur-xl`, semi-transparent backgrounds, subtle borders
- **3D card effects** — CSS perspective tilt, holographic sheen overlay, hover animations
- **Mobile-first** — touch targets ≥ 44px, bottom nav, swipe gestures
- **Motion** — Framer Motion for page transitions, list animations, card reveals
- **Fonts** — Inter (body), Space Grotesk (display/headings), JetBrains Mono (prices/codes)
- **Icons** — Lucide React exclusively

## Performance

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Bundle (initial) | < 200KB gzipped |

- Code split per route with `next/dynamic`
- Image optimization: WebP via `next/image`, lazy loading
- Virtual scrolling for lists > 50 items (`@tanstack/virtual`)
- No O(n²) lookups — use `Map`/`Set` for card lookups by ID
- Debounce search inputs (300ms)

## Security

- No hardcoded credentials (current debt: `supabaseClient.ts` has inline keys)
- API keys server-side only (`POKEMON_TCG_API_KEY`, `GEMINI_API_KEY`)
- Supabase RLS policies on all 10 tables
- Input validation with Zod on all form inputs and API routes
- LGPD compliance: data export, account deletion, consent tracking
- CSRF protection on mutations
- Rate limiting on API routes

## Development Workflow

1. Feature branch from `main` → `feat/`, `fix/`, `refactor/`, `chore/`
2. Implementation follows `.ai/agents/` guidance per domain
3. Run `npm run lint` + tests before PR
4. PR requires passing CI + code review
5. Squash merge to `main`

## Agent Directory

| Agent | File | Domain |
|-------|------|--------|
| Architect | `.ai/agents/architect.md` | System design, migration strategy |
| Frontend | `.ai/agents/frontend-engineer.md` | Components, UI, state |
| Backend | `.ai/agents/backend-engineer.md` | API routes, server actions |
| Supabase | `.ai/agents/supabase-engineer.md` | Database, RLS, auth |
| Data Modeler | `.ai/agents/data-modeler.md` | Types, schemas, contracts |
| Reviewer | `.ai/agents/reviewer.md` | Code review, standards |
| QA | `.ai/agents/qa-engineer.md` | Testing, coverage |
| Performance | `.ai/agents/performance-engineer.md` | Vitals, optimization |
