# Create Supabase Model — Table, RLS, Types & Hooks

## Purpose

Guides the creation of new Supabase tables for PokéVault with production-grade SQL migrations, Row Level Security (RLS) policies, auto-generated TypeScript types, typed Supabase client helpers, Zod validation schemas, and TanStack Query integration hooks. Ensures every model is secure by default (users can only access their own data), type-safe end-to-end, and integrated into the existing 10-table schema.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Table name | ✅ | snake_case (e.g., `trade_history`, `deck_lists`) |
| Domain | ✅ | Which feature area: `collection`, `market`, `social`, `goals`, etc. |
| Columns | ✅ | Column definitions (name, type, constraints, defaults) |
| Relations | ✅ | Foreign keys to existing tables |
| RLS scope | ✅ | `user-owned` (default), `public-read`, `admin-only` |
| Indexes | ⬚ | Additional indexes beyond auto-PK and FK |
| Enums | ⬚ | New PostgreSQL enums needed |
| Triggers | ⬚ | Custom triggers (e.g., audit log, computed fields) |

---

## Outputs

```
supabase/migrations/
└── YYYYMMDDHHMMSS_create_<table_name>.sql     # DDL + RLS + indexes + triggers

src/types/
├── database.ts                                 # Updated generated types (via CLI)
└── <domain>.ts                                 # Domain-specific TypeScript interfaces

src/schemas/
└── <domain>.schema.ts                          # Zod validation schemas

src/services/
└── <domain>.service.ts                         # Supabase CRUD service

src/hooks/
└── use<Domain>.ts                              # TanStack Query hooks

docs/
└── ADR-<NNN>-<table_name>.md                   # Architecture Decision Record
```

---

## Existing Schema Reference

Before creating a new table, review how it relates to the existing 10 tables:

```
┌──────────────────────────────────────────────────────────────┐
│                     auth.users (Supabase Auth)               │
│                         ┌─── id (uuid) ───┐                  │
│                         │                  │                  │
│              ┌──────────┴──────┐    ┌──────┴──────────┐      │
│              │    profiles     │    │     cards        │      │
│              │  ─ display_name │    │  ─ name          │      │
│              │  ─ avatar_url   │    │  ─ set_id        │      │
│              │  ─ currency     │    │  ─ images        │      │
│              │  ─ language     │    │  ─ tcgplayer_url  │      │
│              └────────┬────────┘    │  ─ rarity        │      │
│                       │             └────────┬─────────┘      │
│         ┌─────────────┼──────────────────────┤               │
│         │             │                      │               │
│  ┌──────┴──────┐ ┌────┴──────────┐  ┌───────┴───────┐       │
│  │   binders   │ │collection_items│  │ wishlist_items │       │
│  │ ─ name      │ │ ─ card_id     │  │ ─ card_id      │       │
│  │ ─ cover_id  │ │ ─ quantity    │  │ ─ target_price  │       │
│  │ ─ user_id   │ │ ─ quality     │  │ ─ priority      │       │
│  └─────────────┘ │ ─ grade_type  │  │ ─ user_id       │       │
│                  │ ─ grade_value │  └─────────────────┘       │
│                  │ ─ language    │                            │
│                  │ ─ user_id    │                            │
│                  └──────────────┘                            │
│                                                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │    goals     │  │ market_prices │  │  price_history    │   │
│  │ ─ type       │  │ ─ card_id     │  │ ─ card_id         │   │
│  │ ─ target     │  │ ─ price_usd   │  │ ─ price_usd       │   │
│  │ ─ progress   │  │ ─ source      │  │ ─ recorded_at     │   │
│  │ ─ user_id    │  │ ─ updated_at  │  │ ─ source          │   │
│  └──────────────┘  └───────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────┐               │
│  │ price_notifications │  │   price_alerts   │               │
│  │ ─ card_id           │  │ ─ card_id         │               │
│  │ ─ old_price         │  │ ─ target_price    │               │
│  │ ─ new_price         │  │ ─ direction       │               │
│  │ ─ user_id           │  │ ─ user_id         │               │
│  └─────────────────────┘  └──────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### Existing Enums (PostgreSQL)

| Enum | Values | Used In |
|------|--------|---------|
| `CardLanguage` | `'BR'`, `'EN'`, `'JP'` | `collection_items.language`, `wishlist_items` |
| `CardQuality` | `'M'`, `'NM'`, `'SP'`, `'MP'`, `'HP'`, `'D'` | `collection_items.quality` |
| `GradeType` | `'Raw'`, `'PSA'`, `'CGC'`, `'BGS'` | `collection_items.grade_type` |
| `GoalType` | `'set'`, `'master_set'`, `'pokemon'`, `'value'` | `goals.type` |

### Column Conventions

| Convention | Pattern | Example |
|-----------|---------|---------|
| Primary key | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` | All tables |
| User ownership | `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | All user tables |
| Card reference | `card_id TEXT NOT NULL` | Cards use Pokemon TCG API string IDs |
| Timestamps | `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` | All tables |
| Auto-update | `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` + trigger | Mutable tables |
| Soft delete | NOT used — hard delete with cascade | PokéVault convention |
| Money | `DECIMAL(10, 2)` in USD | All prices stored in USD |

---

## Workflow

### Step 1 — Schema Design

1. **Identify the entity** and its relationship to existing tables.
2. **Choose column types** following PostgreSQL best practices:
   | Data | PostgreSQL Type | TypeScript Type |
   |------|----------------|-----------------|
   | Identifier | `UUID` | `string` |
   | Pokemon TCG card ID | `TEXT` | `string` |
   | Price | `DECIMAL(10, 2)` | `number` |
   | Count | `INTEGER` | `number` |
   | Text content | `TEXT` | `string` |
   | Enum | Custom `ENUM` or `TEXT CHECK` | Union type |
   | Boolean flag | `BOOLEAN` | `boolean` |
   | Date/time | `TIMESTAMPTZ` | `string` (ISO 8601) |
   | JSON data | `JSONB` | Typed interface |
   | Image URLs | `TEXT[]` | `string[]` |

3. **Define constraints**:
   - `NOT NULL` on all required columns
   - `CHECK` constraints for value ranges
   - `UNIQUE` constraints where applicable
   - Foreign key `ON DELETE` behavior (`CASCADE` for user data, `SET NULL` for optional refs)

4. **Plan indexes**:
   - `user_id` — always indexed (RLS performance)
   - Columns used in `WHERE` clauses
   - Columns used in `ORDER BY`
   - Composite indexes for common query patterns

### Step 2 — Write SQL Migration

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_<table_name>.sql
-- Description: <what this table stores and why>

-- ============================================================
-- 1. ENUMS (if new ones needed)
-- ============================================================
-- Only create if the enum doesn't already exist
DO $$ BEGIN
  CREATE TYPE trade_direction AS ENUM ('given', 'received');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS <table_name> (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User ownership (required for RLS)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Foreign keys to existing tables
  card_id TEXT NOT NULL,

  -- Domain-specific columns
  direction trade_direction NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  estimated_value_usd DECIMAL(10, 2) CHECK (estimated_value_usd >= 0),
  notes TEXT,

  -- Reuse existing enums
  quality TEXT CHECK (quality IN ('M', 'NM', 'SP', 'MP', 'HP', 'D')),
  grade_type TEXT CHECK (grade_type IN ('Raw', 'PSA', 'CGC', 'BGS')),
  grade_value TEXT,
  language TEXT CHECK (language IN ('BR', 'EN', 'JP')) DEFAULT 'EN',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
-- Always index user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_<table>_user_id
  ON <table_name>(user_id);

-- Index foreign keys
CREATE INDEX IF NOT EXISTS idx_<table>_card_id
  ON <table_name>(card_id);

-- Index common query patterns
CREATE INDEX IF NOT EXISTS idx_<table>_user_created
  ON <table_name>(user_id, created_at DESC);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own rows
CREATE POLICY "Users can view own <table>"
  ON <table_name> FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own rows
CREATE POLICY "Users can insert own <table>"
  ON <table_name> FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own rows
CREATE POLICY "Users can update own <table>"
  ON <table_name> FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own rows
CREATE POLICY "Users can delete own <table>"
  ON <table_name> FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. TRIGGERS
-- ============================================================
-- Auto-update updated_at on row modification
CREATE TRIGGER set_<table>_updated_at
  BEFORE UPDATE ON <table_name>
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- ============================================================
-- 6. COMMENTS
-- ============================================================
COMMENT ON TABLE <table_name> IS '<Human-readable description>';
COMMENT ON COLUMN <table_name>.user_id IS 'Owner of this record';
COMMENT ON COLUMN <table_name>.card_id IS 'Pokemon TCG API card identifier';
```

### Step 3 — Generate TypeScript Types

After applying the migration, regenerate types:

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

Then create domain-specific interfaces that map from the generated types:

```typescript
// src/types/trade.ts
import type { Database } from './database';

/** Row type from Supabase generated types */
type TradeHistoryRow = Database['public']['Tables']['trade_history']['Row'];
type TradeHistoryInsert = Database['public']['Tables']['trade_history']['Insert'];
type TradeHistoryUpdate = Database['public']['Tables']['trade_history']['Update'];

/** Application-level trade history interface with camelCase naming */
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
  createdAt: string;
  updatedAt: string;
}

/** Mapper: Supabase row → application type */
export function mapRowToTradeHistory(row: TradeHistoryRow): TradeHistory {
  return {
    id: row.id,
    userId: row.user_id,
    cardId: row.card_id,
    direction: row.direction as TradeDirection,
    tradePartner: row.trade_partner,
    quantity: row.quantity,
    estimatedValueUsd: row.estimated_value_usd ? Number(row.estimated_value_usd) : null,
    gradeType: row.grade_type as GradeType | null,
    gradeValue: row.grade_value,
    quality: row.quality as CardQuality | null,
    language: (row.language ?? 'EN') as CardLanguage,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Mapper: application input → Supabase insert */
export function mapInputToRow(input: CreateTradeInput, userId: string): TradeHistoryInsert {
  return {
    user_id: userId,
    card_id: input.cardId,
    direction: input.direction,
    trade_partner: input.tradePartner ?? null,
    quantity: input.quantity ?? 1,
    estimated_value_usd: input.estimatedValueUsd ?? null,
    grade_type: input.gradeType ?? null,
    grade_value: input.gradeValue ?? null,
    quality: input.quality ?? null,
    language: input.language ?? 'EN',
    notes: input.notes ?? null,
  };
}
```

### Step 4 — Create Zod Validation Schema

```typescript
// src/schemas/trade.schema.ts
import { z } from 'zod';

const CARD_LANGUAGES = ['BR', 'EN', 'JP'] as const;
const CARD_QUALITIES = ['M', 'NM', 'SP', 'MP', 'HP', 'D'] as const;
const GRADE_TYPES = ['Raw', 'PSA', 'CGC', 'BGS'] as const;
const TRADE_DIRECTIONS = ['given', 'received'] as const;

export const createTradeSchema = z.object({
  cardId: z.string().min(1, 'Card ID is required'),
  direction: z.enum(TRADE_DIRECTIONS, {
    errorMap: () => ({ message: 'Direction must be "given" or "received"' }),
  }),
  tradePartner: z.string().max(100).optional(),
  quantity: z.number().int().positive().default(1),
  estimatedValueUsd: z.number().nonnegative().optional(),
  gradeType: z.enum(GRADE_TYPES).optional(),
  gradeValue: z.string().max(20).optional(),
  quality: z.enum(CARD_QUALITIES).optional(),
  language: z.enum(CARD_LANGUAGES).default('EN'),
  notes: z.string().max(1000).optional(),
  tradedAt: z.string().datetime().optional(),
}).refine(
  (data) => {
    // If gradeType is provided and not 'Raw', gradeValue is required
    if (data.gradeType && data.gradeType !== 'Raw' && !data.gradeValue) {
      return false;
    }
    return true;
  },
  { message: 'Grade value is required for graded cards', path: ['gradeValue'] },
);

export const updateTradeSchema = createTradeSchema.partial();

export const tradeFiltersSchema = z.object({
  direction: z.enum(TRADE_DIRECTIONS).optional(),
  cardId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'estimated_value_usd']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type TradeFiltersInput = z.infer<typeof tradeFiltersSchema>;
```

### Step 5 — Implement Service Layer

```typescript
// src/services/trade.service.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { TradeHistory, CreateTradeInput, TradeFiltersInput } from '@/types/trade';
import { mapRowToTradeHistory, mapInputToRow } from '@/types/trade';
import { createTradeSchema, tradeFiltersSchema } from '@/schemas/trade.schema';

export interface ITradeService {
  list(userId: string, filters?: TradeFiltersInput): Promise<TradeHistory[]>;
  getById(id: string): Promise<TradeHistory | null>;
  create(userId: string, input: CreateTradeInput): Promise<TradeHistory>;
  update(id: string, input: Partial<CreateTradeInput>): Promise<TradeHistory>;
  delete(id: string): Promise<void>;
  count(userId: string): Promise<number>;
}

export class TradeService implements ITradeService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async list(userId: string, filters?: TradeFiltersInput): Promise<TradeHistory[]> {
    const validatedFilters = tradeFiltersSchema.parse(filters ?? {});

    let query = this.supabase
      .from('trade_history')
      .select('*')
      .eq('user_id', userId);

    if (validatedFilters.direction) {
      query = query.eq('direction', validatedFilters.direction);
    }
    if (validatedFilters.cardId) {
      query = query.eq('card_id', validatedFilters.cardId);
    }
    if (validatedFilters.dateFrom) {
      query = query.gte('created_at', validatedFilters.dateFrom);
    }
    if (validatedFilters.dateTo) {
      query = query.lte('created_at', validatedFilters.dateTo);
    }

    query = query
      .order(validatedFilters.sortBy, { ascending: validatedFilters.sortOrder === 'asc' })
      .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list trades: ${error.message}`);

    return (data ?? []).map(mapRowToTradeHistory);
  }

  async getById(id: string): Promise<TradeHistory | null> {
    const { data, error } = await this.supabase
      .from('trade_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Row not found
      throw new Error(`Failed to get trade: ${error.message}`);
    }

    return mapRowToTradeHistory(data);
  }

  async create(userId: string, input: CreateTradeInput): Promise<TradeHistory> {
    const validated = createTradeSchema.parse(input);
    const row = mapInputToRow(validated, userId);

    const { data, error } = await this.supabase
      .from('trade_history')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Failed to create trade: ${error.message}`);
    return mapRowToTradeHistory(data);
  }

  async update(id: string, input: Partial<CreateTradeInput>): Promise<TradeHistory> {
    const { data, error } = await this.supabase
      .from('trade_history')
      .update({
        ...(input.direction && { direction: input.direction }),
        ...(input.tradePartner !== undefined && { trade_partner: input.tradePartner }),
        ...(input.quantity && { quantity: input.quantity }),
        ...(input.estimatedValueUsd !== undefined && { estimated_value_usd: input.estimatedValueUsd }),
        ...(input.gradeType !== undefined && { grade_type: input.gradeType }),
        ...(input.gradeValue !== undefined && { grade_value: input.gradeValue }),
        ...(input.quality !== undefined && { quality: input.quality }),
        ...(input.language && { language: input.language }),
        ...(input.notes !== undefined && { notes: input.notes }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update trade: ${error.message}`);
    return mapRowToTradeHistory(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('trade_history')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete trade: ${error.message}`);
  }

  async count(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('trade_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to count trades: ${error.message}`);
    return count ?? 0;
  }
}
```

### Step 6 — Create TanStack Query Hooks

```typescript
// src/hooks/useTrades.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TradeHistory, CreateTradeInput, TradeFiltersInput } from '@/types/trade';
import { tradeService } from '@/services';
import { useAuth } from '@/hooks/useAuth';

// ─── Query Key Factory ──────────────────────────────────────
export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: TradeFiltersInput) => [...tradeKeys.lists(), filters] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
  count: (userId: string) => [...tradeKeys.all, 'count', userId] as const,
};

// ─── Queries ─────────────────────────────────────────────────
export function useTrades(filters: TradeFiltersInput = {}) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: () => tradeService.list(userId!, filters),
    staleTime: 5 * 60 * 1000,        // 5 minutes
    gcTime: 30 * 60 * 1000,          // 30 minutes garbage collection
    enabled: !!userId,
    placeholderData: (previousData) => previousData, // Keep old data while fetching
  });
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: tradeKeys.detail(id),
    queryFn: () => tradeService.getById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useTradeCount() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: tradeKeys.count(userId!),
    queryFn: () => tradeService.count(userId!),
    staleTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

// ─── Mutations ───────────────────────────────────────────────
export function useCreateTrade() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTradeInput) =>
      tradeService.create(userId!, input),

    onMutate: async (newTrade) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() });

      // Snapshot previous value
      const previousTrades = queryClient.getQueryData<TradeHistory[]>(
        tradeKeys.lists(),
      );

      // Optimistic insert
      queryClient.setQueryData<TradeHistory[]>(
        tradeKeys.lists(),
        (old = []) => [
          {
            id: crypto.randomUUID(),
            userId: userId!,
            cardId: newTrade.cardId,
            direction: newTrade.direction,
            tradePartner: newTrade.tradePartner ?? null,
            quantity: newTrade.quantity ?? 1,
            estimatedValueUsd: newTrade.estimatedValueUsd ?? null,
            gradeType: newTrade.gradeType ?? null,
            gradeValue: newTrade.gradeValue ?? null,
            quality: newTrade.quality ?? null,
            language: newTrade.language ?? 'EN',
            notes: newTrade.notes ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } satisfies TradeHistory,
          ...old,
        ],
      );

      return { previousTrades };
    },

    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTrades) {
        queryClient.setQueryData(tradeKeys.lists(), context.previousTrades);
      }
    },

    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTradeInput> }) =>
      tradeService.update(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.detail(id) });

      const previousTrade = queryClient.getQueryData<TradeHistory>(
        tradeKeys.detail(id),
      );

      if (previousTrade) {
        queryClient.setQueryData<TradeHistory>(
          tradeKeys.detail(id),
          { ...previousTrade, ...input, updatedAt: new Date().toISOString() },
        );
      }

      return { previousTrade };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousTrade) {
        queryClient.setQueryData(tradeKeys.detail(id), context.previousTrade);
      }
    },

    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradeService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() });

      const previousTrades = queryClient.getQueryData<TradeHistory[]>(
        tradeKeys.lists(),
      );

      // Optimistic remove
      queryClient.setQueryData<TradeHistory[]>(
        tradeKeys.lists(),
        (old = []) => old.filter((t) => t.id !== id),
      );

      return { previousTrades };
    },

    onError: (_err, _id, context) => {
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

---

## RLS Policy Patterns

### Pattern 1: User-Owned Data (Default)

Most PokéVault tables follow this pattern — users can only CRUD their own rows.

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON <table> FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON <table> FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON <table> FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own" ON <table> FOR DELETE USING (auth.uid() = user_id);
```

### Pattern 2: Public Read, Owner Write

For shared data like card metadata that anyone can read but only the system can write.

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select" ON <table> FOR SELECT USING (true);
CREATE POLICY "service_insert" ON <table> FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "service_update" ON <table> FOR UPDATE USING (auth.role() = 'service_role');
```

### Pattern 3: Shared with Privacy Levels

For features where users might share data (e.g., public binders).

```sql
CREATE POLICY "select_own_or_public" ON <table> FOR SELECT
  USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY "modify_own" ON <table> FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Validation Steps

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | Migration applies cleanly | `supabase db reset` succeeds |
| 2 | RLS blocks cross-user access | Query as User B → returns 0 rows from User A |
| 3 | RLS allows own-user access | Query as User A → returns own rows |
| 4 | Types are generated | `npx supabase gen types typescript` produces `trade_history` types |
| 5 | Mapper is lossless | `mapRowToTradeHistory(mapInputToRow(input))` ≈ `input` |
| 6 | Zod rejects invalid input | Schema rejects negative quantity, invalid enum values |
| 7 | Service CRUD works | All 4 operations succeed against local Supabase |
| 8 | Hooks hydrate correctly | Server prefetch → client hydration with no loading flash |
| 9 | Optimistic updates work | Network tab shows UI update before server response |
| 10 | Cascade deletes work | Deleting user removes all related rows |

---

## Quality Gates

- [ ] **Migration**: Applies cleanly on `supabase db reset`
- [ ] **RLS Enabled**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` present
- [ ] **4 RLS Policies**: SELECT, INSERT, UPDATE, DELETE all scoped to `auth.uid()`
- [ ] **Indexes**: `user_id` indexed, FK columns indexed, query pattern columns indexed
- [ ] **Types Generated**: `database.ts` regenerated and committed
- [ ] **Mappers**: Row → App type and App input → Row mappers exist
- [ ] **Zod Schema**: All inputs validated before hitting DB
- [ ] **Service Interface**: `I<Domain>Service` interface defined
- [ ] **TanStack Hooks**: Query key factory + hooks with `staleTime` + optimistic mutations
- [ ] **No `any`**: All types explicit, no `as any` casts
- [ ] **Timestamps**: `created_at` and `updated_at` with auto-update trigger
- [ ] **Comments**: `COMMENT ON TABLE` and `COMMENT ON COLUMN` for documentation
- [ ] **ADR**: Architecture Decision Record written for schema choices

---

## PokéVault Example: Creating `trade_history` Table

See the complete workflow artifacts produced by this skill:

### Migration File
`supabase/migrations/20260624150000_create_trade_history.sql`
- Creates `trade_direction` enum
- Creates `trade_history` table with 14 columns
- 3 indexes: `user_id`, `card_id`, `user_id + created_at DESC`
- 4 RLS policies (user-owned pattern)
- `updated_at` auto-update trigger

### Type File
`src/types/trade.ts`
- `TradeHistory` interface (14 fields, all typed)
- `CreateTradeInput` interface (10 fields, optionals marked)
- `TradeDirection` union type
- `mapRowToTradeHistory()` mapper
- `mapInputToRow()` mapper

### Zod Schema
`src/schemas/trade.schema.ts`
- `createTradeSchema` with refinement (gradeValue required if gradeType ≠ Raw)
- `updateTradeSchema` (partial of create)
- `tradeFiltersSchema` with defaults

### Service
`src/services/trade.service.ts`
- `ITradeService` interface with 6 methods
- `TradeService` class implementing all methods
- Input validation with Zod before DB operations
- Proper error handling with descriptive messages

### TanStack Query Hooks
`src/hooks/useTrades.ts`
- `tradeKeys` factory (all, lists, list, details, detail, count)
- `useTrades()` — list with filters
- `useTrade()` — single by ID
- `useTradeCount()` — count for user
- `useCreateTrade()` — mutation with optimistic insert
- `useUpdateTrade()` — mutation with optimistic update
- `useDeleteTrade()` — mutation with optimistic remove
