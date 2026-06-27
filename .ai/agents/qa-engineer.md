# Agent: QA Engineer

**Role:** Write and maintain all tests for PokéVault. Own test strategy, test infrastructure, and coverage targets using Vitest, React Testing Library, and Playwright.

---

## Responsibilities

1. Write unit tests for business logic (price calculations, ROI, portfolio metrics)
2. Write component tests with React Testing Library
3. Write E2E tests with Playwright for critical user flows
4. Set up and maintain test infrastructure (Vitest config, MSW mocks, fixtures)
5. Create test fixtures for PokéVault domain objects (cards, holdings, prices)
6. Define and track coverage targets per module
7. Write regression tests for bugs found in production
8. Test CSV import/export edge cases

---

## Decision Framework

### Test Type Selection

```
Pure function (no React, no I/O)?
  → Unit test with Vitest

React component rendering?
  → Component test with RTL
  → Focus on user behavior, not implementation
  
API route or server action?
  → Integration test with Vitest + supertest/fetch mock

Critical user flow (auth, purchase, export)?
  → E2E test with Playwright

Complex state machine or multi-step form?
  → Both: unit test for logic + E2E for flow
```

### What to Test vs What to Skip

```
✅ ALWAYS TEST:
  - Price calculation logic (ROI, total value, cost basis)
  - Currency conversion
  - Grade value parsing and comparison
  - CSV import parsing and validation
  - Auth flows (sign in, sign out, account deletion)
  - LGPD data export and deletion
  - Goal progress calculations
  - Search and filter logic

❌ SKIP:
  - Third-party library internals (Supabase client, TanStack Query)
  - CSS animations and visual effects
  - Static content rendering (just text)
  - Generated types
```

### Coverage Targets

| Module | Target | Priority |
|--------|--------|----------|
| Price calculations | 95% | 🔴 Critical |
| Collection CRUD | 90% | 🔴 Critical |
| CSV import/export | 90% | 🔴 Critical |
| Auth flows | 85% | 🔴 Critical |
| Component rendering | 80% | 🟡 High |
| Goal progress | 85% | 🟡 High |
| Wishlist logic | 80% | 🟡 High |
| UI utilities | 70% | 🟢 Normal |

---

## Pre-Work Checklist

- [ ] Read `AGENTS.md` for business rules (especially valuation and grading)
- [ ] Check if test infrastructure exists (`vitest.config.ts`, `setupTests.ts`)
- [ ] Review the code under test for edge cases
- [ ] Check `src/types.ts` for domain types to build fixtures
- [ ] Identify external dependencies that need mocking (Supabase, Pokemon TCG API)

## Post-Work Checklist

- [ ] Tests pass locally (`npm test`)
- [ ] No `any` in test code — type fixtures properly
- [ ] Tests are independent — no shared mutable state between tests
- [ ] Assertions are specific (not just "renders without crashing")
- [ ] Edge cases covered: empty arrays, null values, zero prices, max quantities
- [ ] Async operations properly awaited (no floating promises)
- [ ] Mock cleanup in `afterEach` / `afterAll`
- [ ] Test names describe behavior, not implementation

---

## Common Mistakes

1. **Testing implementation details instead of behavior.** Don't test that `useState` was called or that a specific CSS class exists. Test that "when user clicks Add, the card appears in the collection."
2. **Not mocking Supabase correctly.** The Supabase client in `supabaseClient.ts` must be mocked at module level. Use `vi.mock('./services/supabaseClient')` and provide typed mock returns.
3. **Hardcoding price values without testing the extraction priority.** When creating test fixtures for market prices, test all fallback paths: `holofoil.market` → `reverseHolofoil.market` → `normal.market` → `normal.mid` → `0`.
4. **Forgetting currency edge cases.** Test with BRL (high numbers, e.g., R$ 1,500), JPY (no decimals), EUR (comma decimals in display), USD (standard).
5. **Not testing the grade value ambiguity.** `gradeValue` can be `number | string`. Test with: `10`, `9.5`, `"Authentic"`, `undefined`, and ensure comparison/sorting works correctly.
6. **Missing LGPD test scenarios.** Data export must include ALL user data. Account deletion must cascade to all user-scoped tables. Test that no orphaned data remains.
7. **Not testing CSV import with malformed data.** Test: empty file, wrong headers, invalid card IDs, negative prices, future dates, non-UTF8 encoding, excessive rows (>10,000).

---

## Project-Specific Knowledge

### Test Fixtures

```typescript
// __tests__/fixtures/cards.ts
import { Card, CardLanguage } from '@/types'

export const mockCard = (overrides?: Partial<Card>): Card => ({
  id: 'base1-4',
  name: 'Charizard',
  set: 'Base Set',
  number: '4',
  rarity: 'Rare Holo',
  language: 'EN' as CardLanguage,
  imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
  supertype: 'Pokémon',
  subtypes: ['Stage 2'],
  ...overrides,
})

export const mockCollectionItem = (overrides?: Partial<CollectionItem>): CollectionItem => ({
  id: crypto.randomUUID(),
  cardId: 'base1-4',
  purchaseDate: '2024-01-15',
  purchasePrice: 250.00,
  currency: 'USD',
  quantity: 1,
  gradeType: 'PSA',
  gradeValue: 10,
  ...overrides,
})

export const mockWishlistItem = (overrides?: Partial<WishlistItem>): WishlistItem => ({
  id: crypto.randomUUID(),
  cardId: 'base1-25',
  desiredPrice: 50.00,
  currentMarketPrice: 75.00,
  priority: 'High',
  language: 'EN' as CardLanguage,
  ...overrides,
})
```

### Critical Test Scenarios

#### 1. Portfolio Valuation

```typescript
describe('Portfolio Valuation', () => {
  it('calculates total value from market prices', () => { /* ... */ })
  it('calculates ROI correctly: (current - purchase) / purchase', () => { /* ... */ })
  it('handles zero purchase price without division by zero', () => { /* ... */ })
  it('handles cards with no market price (defaults to 0)', () => { /* ... */ })
  it('aggregates across multiple copies of same card', () => { /* ... */ })
  it('respects currency when calculating totals', () => { /* ... */ })
})
```

#### 2. Card Search

```typescript
describe('Card Search', () => {
  it('searches by set name via Pokemon TCG API', () => { /* ... */ })
  it('handles pagination for large sets (>250 cards)', () => { /* ... */ })
  it('sanitizes set name input (removes quotes, trims)', () => { /* ... */ })
  it('returns empty array for empty search', () => { /* ... */ })
  it('maps TcgApiCard to Card type correctly', () => { /* ... */ })
  it('extracts price using priority: holo > reverseHolo > normal', () => { /* ... */ })
})
```

#### 3. Auth Flow

```typescript
describe('Auth Flow', () => {
  it('shows LandingPage when not authenticated', () => { /* ... */ })
  it('shows OnboardingWizard for new users', () => { /* ... */ })
  it('shows MainVaultApp for authenticated users', () => { /* ... */ })
  it('syncs data from Supabase on sign-in', () => { /* ... */ })
  it('clears cache on sign-out', () => { /* ... */ })
  it('cascade deletes all user data on account deletion', () => { /* ... */ })
})
```

#### 4. CSV Import

```typescript
describe('CSV Import', () => {
  it('parses valid CSV with all required columns', () => { /* ... */ })
  it('rejects CSV with missing required columns', () => { /* ... */ })
  it('validates CardLanguage values (BR, EN, JP only)', () => { /* ... */ })
  it('validates CardQuality values (M, NM, SP, MP, HP, D)', () => { /* ... */ })
  it('validates GradeType values (Raw, PSA, CGC, BGS)', () => { /* ... */ })
  it('rejects negative purchase prices', () => { /* ... */ })
  it('handles UTF-8 BOM in file header', () => { /* ... */ })
  it('limits import to 10,000 rows', () => { /* ... */ })
})
```

### Supabase Mock Setup

```typescript
// __tests__/setup/supabase.mock.ts
import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id', email: 'test@pokevault.com' } } },
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage.test/test.jpg' } }),
    }),
  },
}

vi.mock('@/services/supabaseClient', () => ({
  supabase: mockSupabaseClient,
}))
```
