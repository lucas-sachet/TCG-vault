# Agent: Supabase Engineer

**Role:** Own all Supabase infrastructure: database schema, RLS policies, migrations, auth configuration, storage buckets, and real-time subscriptions.

---

## Responsibilities

1. Design and maintain the PostgreSQL schema across all 10 tables
2. Write and review Row Level Security (RLS) policies for every table
3. Create and manage database migrations
4. Configure Supabase Auth (email/password, OAuth providers)
5. Manage Storage buckets for card photos (`card-photos` bucket)
6. Design real-time subscriptions for price notifications
7. Create database functions and triggers (e.g., `updated_at` timestamps)
8. Optimize queries with proper indexes
9. Handle the `supabaseClient.ts` → typed client migration

---

## Decision Framework

### Add Column vs New Table

```
Is the data 1:1 with existing entity?
  → YES → Add column to existing table
  → NO → Is it a collection of related items?
    → YES → New table with foreign key
    → NO → Is it shared across entities?
      → YES → New junction/reference table
      → NO → Re-evaluate if it's needed
```

### RLS Policy Design

```
Every table MUST have:
  1. SELECT policy: users see only their own rows (auth.uid() = user_id)
  2. INSERT policy: users insert only for themselves
  3. UPDATE policy: users update only their own rows
  4. DELETE policy: users delete only their own rows

Exception: `cards` table may have public SELECT (card definitions are shared)
```

### Index Strategy

```
Always index:
  - Foreign key columns (user_id, card_id, binder_id)
  - Columns used in WHERE clauses (language, quality, grade_type)
  - Columns used in ORDER BY (created_at, purchase_date)

Consider composite indexes for:
  - (user_id, card_id) on collection_items — common query pattern
  - (card_id, captured_at) on price_history — time-series queries

Skip indexes for:
  - Boolean columns with low cardinality
  - Columns only used in INSERT (rarely queried)
```

---

## Pre-Work Checklist

- [ ] Read `AGENTS.md` for security requirements
- [ ] Review current schema in `supabase.service.ts` for table shapes
- [ ] Check `src/services/supabaseClient.ts` for current client setup
- [ ] Verify RLS is enabled on target table
- [ ] Check for existing migrations that might conflict

## Post-Work Checklist

- [ ] RLS policies cover SELECT, INSERT, UPDATE, DELETE
- [ ] Migration is reversible (has `down` migration)
- [ ] Foreign keys have `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate
- [ ] New columns have sensible defaults
- [ ] Indexes created for new foreign keys and query patterns
- [ ] Types updated in `src/types.ts` (and future `types/database.ts`)
- [ ] No breaking changes to existing queries in `supabase.service.ts`

---

## Common Mistakes

1. **Forgetting RLS on new tables.** Every table MUST have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and at least one policy. Without RLS, data is publicly accessible via the anon key exposed in `supabaseClient.ts`.
2. **Using the anon key for admin operations.** The current `supabaseClient.ts` creates a client with the anon key. Batch operations (price sync, data migration) need the service role key, used only server-side.
3. **Not handling the user_id column.** Every user-owned table must have `user_id UUID REFERENCES profiles(id) ON DELETE CASCADE`. The current schema links to `auth.users` via `profiles.id`. Never store data without `user_id`.
4. **Ignoring the localStorage → Supabase sync.** Current services dual-write to localStorage and Supabase (see `SupabaseCardService.saveCards()`). When refactoring, ensure the Supabase write is the source of truth and localStorage is removed.
5. **Missing `updated_at` trigger.** All tables should have `updated_at TIMESTAMPTZ DEFAULT NOW()` with a trigger to auto-update on row changes.
6. **Not considering storage policies.** Card photos in the `card-photos` Storage bucket need policies: users can upload/read their own photos. Public URLs should not expose private photos.

---

## Project-Specific Knowledge

### Current 10 Tables

| Table | Primary Key | User-Scoped | Key Columns |
|-------|-------------|-------------|-------------|
| `profiles` | `id` (= auth.uid) | ✅ | email, display_name, avatar_url, onboarded, languages |
| `cards` | `id` (TCG API ID) | ❌ (shared) | name, set, number, rarity, language, image_url, supertype, subtypes |
| `collection_items` | `id` (uuid) | ✅ | card_id, purchase_date, purchase_price, currency, quantity, grade_type, grade_value, cert_number, binder_id, quality, front_photo_url, back_photo_url |
| `wishlist_items` | `id` (uuid) | ✅ | card_id, desired_price, current_market_price, priority, language |
| `binders` | `id` (uuid) | ✅ | name, description, cover_card_id |
| `goals` | `id` (uuid) | ✅ | name, type, target_value |
| `market_prices` | `(card_id)` | ❌ (shared) | card_id, market_price, updated_at |
| `price_history` | `id` (uuid) | ❌ (shared) | card_id, market_price, captured_at |
| `price_notifications` | `id` (uuid) | ✅ | card_id, card_name, language, old_price, new_price, change_percent, is_read |
| `price_alerts` | `(user_id, card_id)` | ✅ | enabled, target_price |

### Column Mapping (TypeScript → PostgreSQL)

```
Card.imageUrl          → cards.image_url
CollectionItem.cardId  → collection_items.card_id
CollectionItem.purchaseDate   → collection_items.purchase_date
CollectionItem.purchasePrice  → collection_items.purchase_price
CollectionItem.gradeType      → collection_items.grade_type
CollectionItem.gradeValue     → collection_items.grade_value
CollectionItem.certNumber     → collection_items.cert_number
CollectionItem.binderId       → collection_items.binder_id
CollectionItem.frontPhotoUrl  → collection_items.front_photo_url
CollectionItem.backPhotoUrl   → collection_items.back_photo_url
WishlistItem.desiredPrice     → wishlist_items.desired_price
WishlistItem.currentMarketPrice → wishlist_items.current_market_price
PriceSnapshot.capturedAt      → price_history.captured_at
PriceSnapshot.marketPrice     → price_history.market_price
PriceNotification.changePercent → price_notifications.change_percent
PriceNotification.isRead      → price_notifications.is_read
CollectionGoal.targetValue    → goals.target_value
```

### RLS Policy Template

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own rows
CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rows
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own rows
CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

### Auth Configuration

- Provider: Email/Password (current), Google OAuth (planned)
- Session: Supabase manages JWT tokens
- `supabase.auth.getSession()` used extensively in `supabase.service.ts` to get `user.id`
- Account deletion: must cascade delete all user data (LGPD requirement)
- Current issue: `handleDeleteAccount()` in `App.tsx` calls Supabase but may not cascade properly
