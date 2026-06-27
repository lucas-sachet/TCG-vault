# Create Feature — End-to-End Implementation

## Purpose

Guides the complete lifecycle of implementing a new feature in PokéVault — from requirement analysis through data modeling, service layer, server/client integration, UI components, testing, and final review. Ensures every feature ships with type safety, RLS security, optimistic updates, proper error handling, and consistent UX within the vault-dark design system.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Feature name | ✅ | Short identifier (e.g., `trade-history`, `price-alerts-v2`) |
| User story | ✅ | "As a collector, I want to … so that …" |
| Affected domain(s) | ✅ | One or more: `collection`, `wishlist`, `binders`, `portfolio`, `market`, `goals`, `settings`, `auth` |
| Data requirements | ✅ | New tables, columns, or relations needed |
| UI scope | ✅ | Pages, modals, tabs, or inline components |
| Priority | ⬚ | High / Medium / Low — influences depth of edge-case handling |
| Dependencies | ⬚ | Other features or migrations that must land first |
| API integrations | ⬚ | External APIs (Pokemon TCG API, price providers) |

---

## Outputs

Every completed feature produces the following artifacts:

```
feat/<feature-name>/
├── supabase/migrations/
│   └── YYYYMMDDHHMMSS_create_<table>.sql    # Migration + RLS policies
├── src/types/<domain>.ts                     # New/updated TypeScript interfaces
├── src/services/<domain>.service.ts          # Service layer (IService interface)
├── src/hooks/use<Feature>.ts                 # TanStack Query hooks
├── src/components/<Feature>/
│   ├── index.ts                              # Barrel export
│   ├── <Feature>Container.tsx                # Smart/container component
│   ├── <Feature>View.tsx                     # Presentational component
│   └── <Feature>*.tsx                        # Sub-components (≤300 lines each)
├── src/app/<route>/
│   ├── page.tsx                              # Server Component page (if new route)
│   ├── loading.tsx                           # Skeleton loader
│   └── error.tsx                             # Error boundary
├── __tests__/
│   ├── <Feature>.test.tsx                    # Component tests (Vitest + RTL)
│   ├── <feature>.service.test.ts             # Service unit tests
│   └── <feature>.hooks.test.ts               # Hook tests
└── docs/
    └── ADR-<NNN>-<feature>.md                # Architecture Decision Record
```

---

## Workflow

### Step 1 — Requirement Analysis

1. Parse the user story into acceptance criteria (Given/When/Then format).
2. Identify which of the 10 existing Supabase tables are affected:
   `profiles` · `cards` · `collection_items` · `wishlist_items` · `binders` · `goals` · `market_prices` · `price_history` · `price_notifications` · `price_alerts`
3. Map to existing service interfaces:
   `ICardService` · `IHoldingService` · `IWishlistService` · `IBinderService` · `IPriceService` · `IGoalService` · `ISettingsService`
4. Determine if a new service interface is needed.
5. Check for conflicts with existing features or in-progress work.
6. Identify Pokemon TCG API endpoints needed (`/cards`, `/sets`) and rate limit implications (1000/day unauth, 30000/day with key).
7. Produce a **Feature Specification** document with:
   - Acceptance criteria
   - Data model changes
   - API surface
   - UI wireframe description
   - Edge cases & error states

### Step 2 — Data Model

1. Design the Supabase table schema following existing conventions:
   - `id` as `uuid` with `gen_random_uuid()` default
   - `user_id` as `uuid` referencing `auth.users(id)` with `ON DELETE CASCADE`
   - `created_at` / `updated_at` timestamps with `now()` defaults
   - Use existing enums: `CardLanguage` (BR, EN, JP), `CardQuality` (M, NM, SP, MP, HP, D), `GoalType` (set, master_set, pokemon, value), `GradeType` (Raw, PSA, CGC, BGS)
2. Write the SQL migration file with:
   - Table creation
   - Indexes (especially on `user_id` and any FK columns)
   - RLS enable + policies (SELECT/INSERT/UPDATE/DELETE scoped to `auth.uid() = user_id`)
   - Trigger for `updated_at` auto-update
3. Generate TypeScript types from the migration:
   ```typescript
   // src/types/<domain>.ts
   export interface TradeHistory {
     id: string;
     userId: string;
     cardId: string;
     // ... all columns typed
   }
   ```
4. Add to the shared `src/types/index.ts` barrel export.

### Step 3 — Service Layer

1. Define the service interface in `src/services/interfaces/`:
   ```typescript
   export interface ITradeService {
     getTradeHistory(userId: string, options?: TradeQueryOptions): Promise<TradeHistory[]>;
     createTrade(trade: CreateTradeInput): Promise<TradeHistory>;
     updateTrade(id: string, updates: UpdateTradeInput): Promise<TradeHistory>;
     deleteTrade(id: string): Promise<void>;
   }
   ```
2. Implement the service class using the typed Supabase client:
   ```typescript
   // src/services/trade.service.ts
   export class TradeService implements ITradeService {
     constructor(private supabase: SupabaseClient<Database>) {}
     // ... methods with proper error handling
   }
   ```
3. Rules:
   - No `any` types — use `Database` generated types
   - All methods return `Promise<T>` with proper error wrapping
   - Use `Map`/`Set` for O(1) lookups when processing collections
   - Validate inputs with Zod schemas before DB operations
   - Keep service files ≤ 400 lines — split by subdomain if needed

### Step 4 — TanStack Query Hooks

1. Create query hooks in `src/hooks/`:
   ```typescript
   // src/hooks/useTrades.ts
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

   // Query key factory
   export const tradeKeys = {
     all: ['trades'] as const,
     lists: () => [...tradeKeys.all, 'list'] as const,
     list: (filters: TradeFilters) => [...tradeKeys.lists(), filters] as const,
     details: () => [...tradeKeys.all, 'detail'] as const,
     detail: (id: string) => [...tradeKeys.details(), id] as const,
   };

   export function useTrades(filters: TradeFilters) {
     return useQuery({
       queryKey: tradeKeys.list(filters),
       queryFn: () => tradeService.getTradeHistory(userId, filters),
       staleTime: 5 * 60 * 1000, // 5 minutes
     });
   }

   export function useCreateTrade() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: tradeService.createTrade,
       onMutate: async (newTrade) => {
         // Optimistic update
         await queryClient.cancelQueries({ queryKey: tradeKeys.lists() });
         const previous = queryClient.getQueryData(tradeKeys.lists());
         queryClient.setQueryData(tradeKeys.lists(), (old) => [...old, optimistic]);
         return { previous };
       },
       onError: (_err, _new, context) => {
         queryClient.setQueryData(tradeKeys.lists(), context?.previous);
       },
       onSettled: () => {
         queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
       },
     });
   }
   ```
2. Rules:
   - Always define a `queryKeys` factory for cache management
   - Implement optimistic updates for all mutations
   - Set appropriate `staleTime` (data freshness):
     - User data (collection, wishlist): 5 minutes
     - Market prices: 15 minutes
     - Static data (sets, card metadata): 1 hour
   - Handle loading, error, and empty states in the hook consumers
   - Use `select` for data transformations — never transform in components

### Step 5 — UI Components

1. Plan the component tree (max 300 lines per component):
   ```
   <TradeHistoryContainer>          ← Smart: data fetching, state
     <TradeHistoryHeader />         ← Presentational: title, filters
     <TradeHistoryList>             ← Presentational: virtual scroll
       <TradeHistoryItem />         ← Presentational: single trade card
     </TradeHistoryList>
     <TradeHistoryEmptyState />     ← Presentational: onboarding CTA
     <CreateTradeModal />           ← Smart: form + mutation
   </TradeHistoryContainer>
   ```
2. Component implementation rules:
   - **Server Components by default** — add `'use client'` only for:
     - Event handlers (onClick, onChange)
     - Browser APIs (localStorage, IntersectionObserver)
     - TanStack Query hooks
     - Motion/Framer Motion animations
   - **Props interface with JSDoc**:
     ```typescript
     /** Props for a single trade history entry */
     interface TradeHistoryItemProps {
       /** The trade record to display */
       trade: TradeHistory;
       /** Card data for image and name display */
       card: Card;
       /** Callback when user clicks to view details */
       onViewDetails: (tradeId: string) => void;
     }
     ```
   - **Styling**: Tailwind v4 with vault-dark tokens:
     - Backgrounds: `bg-[#0f0f1a]`, `bg-[#1b202c]`, `bg-[#222938]`
     - Accent: `text-[#fbbf24]` (vault-gold), `bg-[#6366f1]` (vault-accent)
     - Glassmorphism: `backdrop-blur-xl bg-white/5 border border-white/10`
     - Fonts: `font-sans` (Inter), `font-display` (Space Grotesk), `font-mono` (JetBrains Mono for prices)
   - **Animation**: Motion library for:
     - Page transitions: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
     - List items: `AnimatePresence` with staggered children
     - Cards: 3D tilt on hover with CSS perspective
     - Price changes: color flash green/red
   - **Accessibility**:
     - All interactive elements have `aria-label` or visible label
     - Keyboard navigation with `tabIndex`, `onKeyDown`
     - Focus management for modals (`focus-trap`)
     - Color contrast ratio ≥ 4.5:1 on dark backgrounds
   - **Responsive**: Mobile-first with touch targets ≥ 44px, bottom nav awareness

3. Create barrel export in `index.ts`:
   ```typescript
   export { TradeHistoryContainer } from './TradeHistoryContainer';
   export { TradeHistoryItem } from './TradeHistoryItem';
   export type { TradeHistoryItemProps } from './TradeHistoryItem';
   ```

### Step 6 — Testing

1. **Service tests** (Vitest):
   ```typescript
   describe('TradeService', () => {
     it('should create a trade with valid data', async () => { ... });
     it('should reject trade with missing cardId', async () => { ... });
     it('should only return trades for the authenticated user', async () => { ... });
     it('should calculate trade value in correct currency', async () => { ... });
   });
   ```
2. **Hook tests** (Vitest + `@testing-library/react-hooks`):
   ```typescript
   describe('useTrades', () => {
     it('should fetch trades for current user', async () => { ... });
     it('should handle empty trade history', async () => { ... });
     it('should optimistically update on create', async () => { ... });
   });
   ```
3. **Component tests** (Vitest + RTL):
   ```typescript
   describe('TradeHistoryItem', () => {
     it('should render card image and trade details', () => { ... });
     it('should display price in selected currency', () => { ... });
     it('should call onViewDetails when clicked', () => { ... });
     it('should be keyboard accessible', () => { ... });
   });
   ```
4. **E2E tests** (Playwright — for critical paths only):
   ```typescript
   test('user can record a new trade', async ({ page }) => {
     await page.goto('/app/trades');
     await page.click('[data-testid="create-trade-button"]');
     // ... fill form, submit, verify
   });
   ```

### Step 7 — Review & Integration

1. Run lint: `npm run lint` — zero errors, zero warnings.
2. Run type check: `npx tsc --noEmit` — zero errors.
3. Run tests: `npm run test` — all passing.
4. Verify bundle impact: check that initial bundle stays < 200KB gzipped.
5. Verify RLS policies with Supabase CLI: `supabase db test`.
6. Write ADR documenting key decisions.
7. Create PR following branch naming: `feat/<feature-name>`.

---

## Validation Steps

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | Types are complete | `npx tsc --noEmit` passes with no errors |
| 2 | RLS is enforced | Query from another user's context returns empty results |
| 3 | Optimistic updates work | Network tab shows UI updates before server response |
| 4 | Error states render | Simulate 500 error — error boundary catches and displays fallback |
| 5 | Loading states render | Throttle network — skeleton/spinner appears |
| 6 | Empty states render | New user with no data sees onboarding prompt |
| 7 | Mobile responsive | Chrome DevTools mobile viewport — all touch targets ≥ 44px |
| 8 | Keyboard accessible | Tab through all interactive elements — visible focus rings |
| 9 | No N+1 queries | Supabase logs show single query with joins, not loops |
| 10 | Currency conversion | Switch display currency — all prices update correctly |

---

## Quality Gates

All gates must pass before a feature is considered complete:

- [ ] **Type Safety**: Zero `any` types, zero `as` casts without inline justification
- [ ] **Component Size**: Every `.tsx` file ≤ 300 lines
- [ ] **Service Size**: Every `.service.ts` file ≤ 400 lines
- [ ] **Test Coverage**: ≥ 80% line coverage on new code
- [ ] **RLS Policies**: Every new table has SELECT/INSERT/UPDATE/DELETE policies scoped to `auth.uid()`
- [ ] **Error Boundaries**: Every new route segment has `error.tsx`
- [ ] **Loading States**: Every data-fetching component has skeleton/spinner
- [ ] **Accessibility**: All interactive elements have aria labels, keyboard support
- [ ] **Performance**: No O(n²) operations — use `Map`/`Set` for lookups
- [ ] **Documentation**: ADR written, JSDoc on all exported interfaces
- [ ] **Barrel Exports**: Named exports only via `index.ts`, no default exports
- [ ] **Bundle Size**: `npm run build` — initial JS < 200KB gzipped

---

## PokéVault Example: Implementing "Trade History"

### User Story
> As a collector, I want to record my card trades (given/received) so that I can track my trading history and see the value exchanged over time.

### 1. Data Model

```sql
-- supabase/migrations/20260624000000_create_trade_history.sql

CREATE TYPE trade_direction AS ENUM ('given', 'received');

CREATE TABLE trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  direction trade_direction NOT NULL,
  trade_partner TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  estimated_value_usd DECIMAL(10, 2),
  grade_type TEXT CHECK (grade_type IN ('Raw', 'PSA', 'CGC', 'BGS')),
  grade_value TEXT,
  quality TEXT CHECK (quality IN ('M', 'NM', 'SP', 'MP', 'HP', 'D')),
  language TEXT CHECK (language IN ('BR', 'EN', 'JP')) DEFAULT 'EN',
  notes TEXT,
  traded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trade_history_user_id ON trade_history(user_id);
CREATE INDEX idx_trade_history_card_id ON trade_history(card_id);
CREATE INDEX idx_trade_history_traded_at ON trade_history(user_id, traded_at DESC);

-- RLS
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades"
  ON trade_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trade_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trade_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trade_history FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON trade_history
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
```

### 2. TypeScript Types

```typescript
// src/types/trade.ts
import type { CardLanguage, CardQuality, GradeType } from './enums';

export type TradeDirection = 'given' | 'received';

export interface TradeHistory {
  id: string;
  userId: string;
  cardId: string;
  direction: TradeDirection;
  tradePartner: string | null;
  quantity: number;
  estimatedValueUsd: number | null;
  gradeType: GradeType | null;
  gradeValue: string | null;
  quality: CardQuality | null;
  language: CardLanguage;
  notes: string | null;
  tradedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradeInput {
  cardId: string;
  direction: TradeDirection;
  tradePartner?: string;
  quantity?: number;
  estimatedValueUsd?: number;
  gradeType?: GradeType;
  gradeValue?: string;
  quality?: CardQuality;
  language?: CardLanguage;
  notes?: string;
  tradedAt?: string;
}

export interface TradeFilters {
  direction?: TradeDirection;
  cardId?: string;
  dateRange?: { from: string; to: string };
  sortBy?: 'traded_at' | 'estimated_value_usd';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TradeSummary {
  totalTradesGiven: number;
  totalTradesReceived: number;
  totalValueGiven: number;
  totalValueReceived: number;
  netValue: number;
  mostTradedCardId: string | null;
}
```

### 3. Service

```typescript
// src/services/trade.service.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { TradeHistory, CreateTradeInput, TradeFilters, TradeSummary } from '@/types/trade';
import { createTradeSchema } from '@/schemas/trade.schema';

export interface ITradeService {
  getTradeHistory(userId: string, filters?: TradeFilters): Promise<TradeHistory[]>;
  getTradeById(id: string): Promise<TradeHistory | null>;
  getTradeSummary(userId: string): Promise<TradeSummary>;
  createTrade(input: CreateTradeInput): Promise<TradeHistory>;
  updateTrade(id: string, updates: Partial<CreateTradeInput>): Promise<TradeHistory>;
  deleteTrade(id: string): Promise<void>;
}

export class TradeService implements ITradeService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getTradeHistory(userId: string, filters?: TradeFilters): Promise<TradeHistory[]> {
    let query = this.supabase
      .from('trade_history')
      .select('*')
      .eq('user_id', userId);

    if (filters?.direction) query = query.eq('direction', filters.direction);
    if (filters?.cardId) query = query.eq('card_id', filters.cardId);
    if (filters?.dateRange) {
      query = query
        .gte('traded_at', filters.dateRange.from)
        .lte('traded_at', filters.dateRange.to);
    }

    const sortBy = filters?.sortBy ?? 'traded_at';
    const sortOrder = filters?.sortOrder ?? 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);

    const { data, error } = await query;
    if (error) throw new TradeServiceError('Failed to fetch trade history', error);
    return data.map(mapRowToTradeHistory);
  }

  async createTrade(input: CreateTradeInput): Promise<TradeHistory> {
    const validated = createTradeSchema.parse(input);
    const { data, error } = await this.supabase
      .from('trade_history')
      .insert(mapInputToRow(validated))
      .select()
      .single();

    if (error) throw new TradeServiceError('Failed to create trade', error);
    return mapRowToTradeHistory(data);
  }

  // ... updateTrade, deleteTrade, getTradeSummary implementations
}
```

### 4. TanStack Query Hooks

```typescript
// src/hooks/useTrades.ts
export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: TradeFilters) => [...tradeKeys.lists(), filters] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
  summary: (userId: string) => [...tradeKeys.all, 'summary', userId] as const,
};

export function useTrades(filters: TradeFilters = {}) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: () => tradeService.getTradeHistory(userId, filters),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useTradeSummary() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: tradeKeys.summary(userId),
    queryFn: () => tradeService.getTradeSummary(userId),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTradeInput) => tradeService.createTrade(input),
    onMutate: async (newTrade) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() });
      const previousTrades = queryClient.getQueryData<TradeHistory[]>(tradeKeys.lists());
      // Optimistic insert
      queryClient.setQueryData<TradeHistory[]>(tradeKeys.lists(), (old = []) => [
        { ...newTrade, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as TradeHistory,
        ...old,
      ]);
      return { previousTrades };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTrades) {
        queryClient.setQueryData(tradeKeys.lists(), context.previousTrades);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}
```

### 5. Components

```
src/components/TradeHistory/
├── index.ts
├── TradeHistoryContainer.tsx    (~120 lines)
├── TradeHistoryHeader.tsx       (~80 lines)
├── TradeHistoryList.tsx         (~100 lines)
├── TradeHistoryItem.tsx         (~90 lines)
├── TradeHistoryEmptyState.tsx   (~60 lines)
├── TradeHistorySummary.tsx      (~80 lines)
└── CreateTradeModal.tsx         (~200 lines)
```

### 6. Route

```
src/app/app/trades/
├── page.tsx       — Server Component: metadata + TradeHistoryContainer
├── loading.tsx    — Skeleton with shimmer animation
└── error.tsx      — Error boundary with retry button
```
