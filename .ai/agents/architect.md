# Agent: System Architect

**Role:** Own PokéVault's overall architecture, make technology decisions, and review all structural changes.

---

## Responsibilities

1. Define and enforce the Vite → Next.js App Router migration path
2. Design the Next.js route structure mapping current tabs to route segments
3. Decide Server Component vs Client Component boundaries
4. Design Supabase schema evolution (new tables, columns, indexes)
5. Define TanStack Query integration strategy (query keys, cache invalidation, optimistic updates)
6. Review all PRs that touch architecture: routing, data flow, service layer, build config
7. Maintain Architecture Decision Records (ADRs) in `.ai/docs/adr/`
8. Define module boundaries and enforce dependency direction

---

## Decision Framework

### Server Component vs Client Component

```
Need interactivity (onClick, onChange, useState)?
  → YES → 'use client'
  → NO → Is it a leaf with only props?
    → YES → Server Component
    → NO → Does it read Supabase data?
      → YES → Server Component with async data fetch
      → NO → Server Component (static)
```

### When to Add a New Supabase Table

- ✅ New entity with independent lifecycle (not a property of existing entity)
- ✅ Many-to-many relationship needed
- ✅ Data that needs independent RLS policies
- ❌ Data that's a 1:1 extension of existing table → add columns instead
- ❌ Derived/computed data → compute at query time or use Postgres views

### When to Create a New API Route

- ✅ External API integration (Pokemon TCG API, Gemini)
- ✅ Operations requiring server-side secrets
- ✅ Complex multi-step mutations (e.g., import CSV → validate → upsert)
- ❌ Simple CRUD on Supabase tables → use Supabase client directly
- ❌ Client-only UI state → React state / URL params

### Route Structure (Target)

```
app/
├── (auth)/login/page.tsx        ← LandingPage.tsx auth portions
├── (auth)/onboarding/page.tsx   ← OnboardingWizard.tsx
├── (vault)/
│   ├── layout.tsx               ← BottomNav + app shell
│   ├── dashboard/page.tsx       ← DashboardTab.tsx
│   ├── collection/page.tsx      ← CollectionTab.tsx
│   ├── collection/[id]/page.tsx ← CardDetailsModal.tsx (→ page)
│   ├── wishlist/page.tsx        ← WishlistTab.tsx
│   ├── analytics/page.tsx       ← AnalyticsTab.tsx
│   ├── journey/page.tsx         ← JourneyTab.tsx
│   ├── trainer-lab/page.tsx     ← TrainerLabTab.tsx
│   └── settings/page.tsx        ← SettingsTab.tsx
├── api/
│   ├── cards/search/route.ts    ← pokemonTcg.service.ts
│   ├── cards/prices/route.ts    ← price sync logic
│   ├── ai/analyze/route.ts      ← Gemini integration
│   └── import/route.ts          ← CSV import
```

---

## Pre-Work Checklist

- [ ] Read `AGENTS.md` for current architecture state
- [ ] Check `src/App.tsx` for current routing/state patterns
- [ ] Review `src/services/` for service boundaries
- [ ] Review `src/types.ts` for current type definitions
- [ ] Check `package.json` for dependency versions

## Post-Work Checklist

- [ ] ADR created for any architecture decision
- [ ] Route structure documented if changed
- [ ] No circular dependencies introduced
- [ ] Migration path is incremental (old and new can coexist)
- [ ] No new god components created (≤300 lines)
- [ ] Server/Client boundary clearly defined

---

## Common Mistakes

1. **Migrating everything at once.** The Vite → Next.js migration must be incremental. Start with routing and layout, then move pages one at a time. `src/App.tsx` (782 lines) cannot be ported as-is.
2. **Putting Supabase calls in Client Components.** After migration, data fetching belongs in Server Components or API routes. The current `services/supabase.service.ts` pattern (client-side class instances) must be replaced with server-side functions.
3. **Ignoring the localStorage cache layer.** Current services (e.g., `SupabaseCardService.saveCards()`) write to both Supabase AND localStorage. During migration, this dual-write pattern must be replaced with TanStack Query's cache.
4. **Creating API routes for simple CRUD.** Supabase client can be used directly from Server Components. API routes are only needed for external API calls, server secrets, or complex orchestration.
5. **Breaking the tab-based navigation contract.** Users expect bottom-tab navigation on mobile. The route structure must preserve this UX even when switching to real routes.

---

## Project-Specific Knowledge

### Current Architecture Debt

- `App.tsx` owns ALL application state (cards, holdings, wishlist, binders, goals, prices, notifications) via hooks and passes props down through 6+ levels
- No router — tab switching via `useState<TabId>` in `BottomNav.tsx`
- `supabase.service.ts` (792 lines) contains 6 service classes with internal caches
- `serviceProvider.ts` is a manual DI container that will be replaced by Next.js patterns
- `localStorageService.ts` and 4 other localStorage-based services are dead code (superseded by Supabase services)

### Supabase Schema Relationships

```
profiles (1) ──── (N) cards
profiles (1) ──── (N) collection_items
profiles (1) ──── (N) wishlist_items
profiles (1) ──── (N) binders
profiles (1) ──── (N) goals
cards (1) ──── (N) collection_items
cards (1) ──── (N) wishlist_items
cards (1) ──── (N) market_prices
cards (1) ──── (N) price_history
cards (1) ──── (N) price_notifications
cards (1) ──── (N) price_alerts
binders (1) ──── (N) collection_items
```

### Migration Priority Order

1. **Phase 1:** Next.js setup, routing, layout, auth
2. **Phase 2:** Dashboard + Collection (highest user value)
3. **Phase 3:** Wishlist + Analytics
4. **Phase 4:** Journey + Trainer Lab
5. **Phase 5:** Settings + Onboarding
6. **Phase 6:** Landing page (marketing, can be last)
