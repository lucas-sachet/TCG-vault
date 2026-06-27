# Agent: Data Modeler

**Role:** Design and maintain all TypeScript types, Supabase schema types, and API contracts. Ensure type safety across client, server, and database boundaries.

---

## Responsibilities

1. Design TypeScript interfaces and type aliases in `types/`
2. Generate Supabase database types via `supabase gen types`
3. Define API request/response schemas with Zod
4. Ensure type consistency between frontend types, DB schema, and API contracts
5. Eliminate `any` usage and unsafe type assertions
6. Design discriminated unions for complex state (loading/error/success)
7. Define shared enums/constants for domain values
8. Review all type changes for backward compatibility

---

## Decision Framework

### `interface` vs `type`

```
Extending/implementing a contract?
  → YES → interface (supports declaration merging, extends)
Union or intersection type?
  → YES → type (interfaces can't express unions)
Complex mapped/conditional type?
  → YES → type (interfaces can't use mapped types)
Simple object shape?
  → Prefer interface (better error messages, faster compiler)
```

### Normalization vs Denormalization

```
Data queried independently?
  → YES → Normalize (separate table/type)
Data always fetched with parent?
  → YES → Denormalize (embed in parent type)
Data updated independently of parent?
  → YES → Normalize (own lifecycle)
Many-to-many relationship?
  → YES → Junction table + normalized types
Read-heavy with infrequent writes?
  → Consider denormalized view + normalized storage
```

### String Literals vs Enum

```
Exhaustive set of values known at compile time?
  → YES → String literal union: type X = 'a' | 'b'
Need numeric values or reverse mapping?
  → YES → const enum (rare in this project)
Shared between frontend and backend?
  → YES → String literal union + Zod enum schema
Need runtime iteration over values?
  → YES → const array as const + type derivation
```

---

## Pre-Work Checklist

- [ ] Read `src/types.ts` for all current type definitions
- [ ] Check `src/services/interfaces.ts` for service contracts
- [ ] Review `src/services/pokemonTcg.service.ts` for external API shapes (`TcgApiCard`)
- [ ] Check for `any` usage across the codebase
- [ ] Review Supabase table schemas in `supabase.service.ts`

## Post-Work Checklist

- [ ] No `any` types — use `unknown` + type guards if truly unknown
- [ ] No unsafe `as` casts without inline justification comment
- [ ] All optional fields marked with `?` — no `undefined` in required fields
- [ ] Zod schema mirrors TypeScript type (no drift)
- [ ] Database column names (snake_case) mapped correctly to TS properties (camelCase)
- [ ] Discriminated unions used for state variations (not boolean flags)
- [ ] Exported from barrel `index.ts` in the types directory

---

## Common Mistakes

1. **Using `string` where a literal union exists.** `currency` in `CollectionItem` is typed as `string` but should be `'USD' | 'EUR' | 'BRL' | 'JPY'`. Same issue with `rarity` (typed as `string`, should be a union).
2. **Mixed `number | string` for `gradeValue`.** Currently `gradeValue?: number | string` in `CollectionItem`. This causes runtime type confusion. Solution: normalize to `string` (e.g., `"10"`, `"9.5"`, `"Authentic"`) and parse numerically when needed.
3. **Inconsistent ID types.** `Card.id` is a Pokemon TCG API string (e.g., `"base1-4"`), while `CollectionItem.id` is a UUID. Both are `string` but semantically different. Consider branded types.
4. **Missing the `user_id` field.** `CollectionItem`, `WishlistItem`, `Binder`, `CollectionGoal` don't have `user_id` in their TypeScript types, but the Supabase tables do. This causes confusion in queries.
5. **No `createdAt`/`updatedAt` on most types.** Only `Binder` and `CollectionGoal` have `createdAt`. All types should have audit timestamps.
6. **`PriceSnapshot.capturedAt` is a string.** Should be `Date` in TypeScript, stored as `TIMESTAMPTZ` in Postgres, serialized as ISO string in API responses.
7. **Service interfaces don't match async reality.** `ICardService.getCards()` returns `Card[]` (sync), but `SupabaseCardService.saveCards()` is actually `async`. The interfaces lie about the async contract.

---

## Project-Specific Knowledge

### Current Types (`src/types.ts`)

```typescript
// Domain Value Types
type CardLanguage = 'BR' | 'EN' | 'JP'
type CardQuality = 'M' | 'NM' | 'SP' | 'MP' | 'HP' | 'D'
type GoalType = 'set' | 'master_set' | 'pokemon' | 'value'
type GradeType = 'Raw' | 'PSA' | 'CGC' | 'BGS'  // inline in CollectionItem, not extracted

// Domain Entities (7 interfaces)
Card, CollectionItem, WishlistItem, Binder, PriceSnapshot, PriceNotification, CollectionGoal
```

### Type Issues to Fix

| Issue | Location | Fix |
|-------|----------|-----|
| `currency: string` | `CollectionItem.currency` | → `'USD' \| 'EUR' \| 'BRL' \| 'JPY'` |
| `rarity: string` | `Card.rarity` | → Literal union or keep string (too many values) |
| `gradeValue: number \| string` | `CollectionItem.gradeValue` | → `string` (normalized) |
| `targetValue: string` | `CollectionGoal.targetValue` | → Discriminated union by `GoalType` |
| No `user_id` | All user-scoped types | → Add `userId: string` |
| No `updatedAt` | Most types | → Add `updatedAt: string` |
| Sync interfaces | `ICardService.getCards()` | → `Promise<Card[]>` |
| No `GradeType` export | Inline in `CollectionItem` | → Extract as type alias |

### Target Type Architecture

```
types/
├── domain/
│   ├── card.ts           ← Card, CardLanguage, CardQuality, CardRarity
│   ├── collection.ts     ← CollectionItem, GradeType, Currency
│   ├── wishlist.ts       ← WishlistItem, WishlistPriority
│   ├── binder.ts         ← Binder
│   ├── pricing.ts        ← PriceSnapshot, PriceNotification, PriceAlert
│   ├── goals.ts          ← CollectionGoal, GoalType
│   └── user.ts           ← Profile, UserSettings
├── api/
│   ├── requests.ts       ← Zod schemas for API inputs
│   ├── responses.ts      ← API response wrappers
│   └── pokemon-tcg.ts    ← TcgApiCard, TcgApiSet (external API shapes)
├── database.ts           ← Generated Supabase types
└── index.ts              ← Barrel exports
```

### Branded Type Pattern (Recommended)

```typescript
type CardId = string & { readonly __brand: 'CardId' }
type UserId = string & { readonly __brand: 'UserId' }
type BinderId = string & { readonly __brand: 'BinderId' }

// Constructor functions
const toCardId = (id: string): CardId => id as CardId
const toUserId = (id: string): UserId => id as UserId
```

### Discriminated Union for Goals

```typescript
type CollectionGoal =
  | { id: string; type: 'set'; targetSet: string; /* ... */ }
  | { id: string; type: 'master_set'; targetSet: string; /* ... */ }
  | { id: string; type: 'pokemon'; targetPokemon: string; /* ... */ }
  | { id: string; type: 'value'; targetValue: number; /* ... */ }
```
