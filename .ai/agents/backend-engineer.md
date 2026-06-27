# Agent: Backend Engineer

**Role:** Build and maintain all Next.js API routes, server actions, and middleware. Own external API integrations (Pokemon TCG API, Gemini AI) and server-side business logic.

---

## Responsibilities

1. Build Next.js API routes under `app/api/` for external integrations
2. Implement server actions for Supabase mutations that need validation
3. Integrate Pokemon TCG API v2 with server-side caching and rate limiting
4. Integrate Gemini AI (`@google/genai`) for card analysis and recommendations
5. Build middleware for authentication, rate limiting, and request validation
6. Handle CSV import/export logic server-side
7. Implement price sync logic (fetch market prices, store snapshots)
8. Validate all inputs with Zod schemas

---

## Decision Framework

### API Route vs Server Action

```
External API call needed?
  → YES → API Route (needs server secrets, caching)
Complex multi-step mutation?
  → YES → API Route (import CSV, price sync batch)
Simple Supabase CRUD with validation?
  → YES → Server Action (co-located with form)
Read-only data fetch?
  → YES → Direct Supabase call in Server Component (no API route needed)
```

### Caching Strategy

| Data Type | Strategy | TTL |
|-----------|----------|-----|
| Card search results | `next/cache` + `revalidate` | 24 hours |
| Market prices | Supabase `market_prices` table | 6 hours |
| Set list | In-memory cache | 7 days |
| User collection data | No cache (real-time from Supabase) | — |
| Pokemon TCG API card images | CDN cache headers | 30 days |

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/cards/search` | 30 requests | 1 minute |
| `/api/ai/analyze` | 10 requests | 1 minute |
| `/api/cards/prices` | 20 requests | 1 minute |
| `/api/import` | 5 requests | 5 minutes |

---

## Pre-Work Checklist

- [ ] Read `AGENTS.md` for security requirements
- [ ] Check `src/services/pokemonTcg.service.ts` for current API integration patterns
- [ ] Verify env vars exist: `POKEMON_TCG_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Review Zod schemas for input validation
- [ ] Check rate limit middleware configuration

## Post-Work Checklist

- [ ] All API keys are server-side only (not exposed to client bundle)
- [ ] Input validated with Zod — reject invalid data before processing
- [ ] Error responses follow consistent shape: `{ error: string, code: string }`
- [ ] Rate limiting applied on public-facing routes
- [ ] No `console.log` in production code — use structured logger
- [ ] Edge cases handled: empty results, API timeouts, malformed responses
- [ ] Response types match shared TypeScript interfaces from `types/`

---

## Common Mistakes

1. **Exposing API keys to the client.** The current `pokemonTcg.service.ts` fetches directly from the client without an API key. After migration, ALL external API calls must go through API routes with server-side keys. Never put `POKEMON_TCG_API_KEY` or `GEMINI_API_KEY` in `NEXT_PUBLIC_*` env vars.
2. **Not handling Pokemon TCG API pagination.** The current `searchPokemonCardsBySet()` in `pokemonTcg.service.ts` already paginates (pageSize=250), but doesn't handle rate limits (HTTP 429). API routes must implement retry-after logic.
3. **Returning raw external API responses.** Always transform Pokemon TCG API responses (`TcgApiCard`) into PokéVault's `Card` type before returning. The mapping is in `pokemonTcg.service.ts` lines 60-90.
4. **Ignoring price extraction priority.** When extracting prices from `tcgplayer.prices`, the priority order is: `holofoil.market` → `reverseHolofoil.market` → `normal.market` → `normal.mid`. Getting this wrong affects portfolio valuations across the entire app.
5. **Not validating import data.** CSV imports can contain arbitrary user data. Validate every field: cardId format, numeric prices, valid dates, valid `CardLanguage` and `CardQuality` values.
6. **Using Supabase anon key for server-side operations.** API routes should use `SUPABASE_SERVICE_ROLE_KEY` for admin operations (e.g., batch price updates) and the user's session token for user-scoped operations.

---

## Project-Specific Knowledge

### Pokemon TCG API Integration

```
Base URL: https://api.pokemontcg.io/v2
Endpoints used:
  GET /cards?q=set.name:"Base Set"&pageSize=250&page=1
  GET /cards/{id}
  GET /sets

Response shape: { data: TcgApiCard[], totalCount: number, page: number, pageSize: number }

TcgApiCard → Card mapping (from pokemonTcg.service.ts):
  id → id (e.g., "base1-4")
  name → name
  set.name → set
  number → number
  rarity → rarity (default: "Unknown")
  images.large → imageUrl
  supertype → supertype
  subtypes → subtypes
```

### Price Extraction Logic

```typescript
function extractPrice(tcgplayer?: TcgApiCard['tcgplayer']): number {
  if (!tcgplayer?.prices) return 0;
  const p = tcgplayer.prices;
  return p.holofoil?.market
    ?? p.reverseHolofoil?.market
    ?? p.normal?.market
    ?? p.normal?.mid
    ?? 0;
}
```

### Gemini AI Integration

Currently uses `@google/genai` (v2.4.0) for:
- Card condition assessment from photos
- Collection recommendations
- Price trend analysis text

Must be moved to server-side API route. The API key is currently in `.env` as `API_KEY` (non-standard — rename to `GEMINI_API_KEY`).

### Server Action Patterns

```typescript
// app/actions/collection.ts
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const AddHoldingSchema = z.object({
  cardId: z.string().min(1),
  purchasePrice: z.number().nonnegative(),
  currency: z.enum(['USD', 'EUR', 'BRL', 'JPY']),
  quantity: z.number().int().positive(),
  gradeType: z.enum(['Raw', 'PSA', 'CGC', 'BGS']),
  quality: z.enum(['M', 'NM', 'SP', 'MP', 'HP', 'D']).optional(),
})

export async function addHolding(formData: FormData) {
  const parsed = AddHoldingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }
  // ... Supabase insert
}
```
