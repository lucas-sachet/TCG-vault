# Create Page — Next.js App Router

## Purpose

Guides the creation of Next.js App Router pages for PokéVault, including the complete route file structure (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`), proper Server/Client component boundaries, metadata configuration, data fetching patterns, and integration with the vault-dark design system. Ensures every page ships with loading states, error boundaries, SEO metadata, and mobile-first responsive layout.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Page name | ✅ | Human-readable name (e.g., "Portfolio Overview", "Card Details") |
| Route path | ✅ | Next.js route (e.g., `/app/portfolio`, `/app/cards/[id]`) |
| Page type | ✅ | `app-tab` (authenticated dashboard tab), `marketing` (public landing), `modal-route` (intercepting route) |
| Data requirements | ✅ | What data the page needs and from where (Supabase, Pokemon TCG API, local state) |
| Interactivity level | ✅ | `static` (SSG), `dynamic` (SSR), `interactive` (client-heavy) |
| Parent layout | ⬚ | Which layout this page inherits from |
| Search params | ⬚ | URL search parameters the page consumes |

---

## Outputs

### Minimal Page (static marketing)
```
src/app/<route>/
└── page.tsx
```

### Standard App Page (authenticated tab)
```
src/app/app/<route>/
├── page.tsx          # Server Component — data fetch + metadata
├── layout.tsx        # Shared layout (if unique to this route)
├── loading.tsx       # Streaming skeleton
├── error.tsx         # Error boundary ('use client')
└── not-found.tsx     # 404 fallback
```

### Dynamic Route Page (e.g., card details)
```
src/app/app/cards/[id]/
├── page.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
└── @modal/
    └── (..)cards/[id]/
        └── page.tsx    # Intercepting route for modal view
```

---

## PokéVault Route Architecture

### App Routes (Authenticated — `/app/*`)

```
src/app/
├── layout.tsx                    # Root layout: fonts, providers, metadata
├── page.tsx                      # Marketing landing page (public)
├── pricing/page.tsx              # Pricing page (public)
├── about/page.tsx                # About page (public)
├── auth/
│   ├── login/page.tsx
│   └── callback/route.ts        # Supabase auth callback
├── app/
│   ├── layout.tsx                # Dashboard layout: sidebar, bottom nav, auth guard
│   ├── collection/
│   │   ├── page.tsx              # Collection grid with filters
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── wishlist/
│   │   ├── page.tsx              # Wishlist with priority sorting
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── binders/
│   │   ├── page.tsx              # Binder list
│   │   ├── [binderId]/
│   │   │   ├── page.tsx          # Single binder view
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── portfolio/
│   │   ├── page.tsx              # Portfolio analytics
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── trainer-lab/
│   │   ├── page.tsx              # AI tools hub
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── settings/
│   │   ├── page.tsx              # Settings tabs
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── cards/
│       └── [id]/
│           ├── page.tsx          # Card detail page (full)
│           ├── loading.tsx
│           ├── error.tsx
│           └── not-found.tsx
```

---

## Workflow

### Step 1 — Determine Page Classification

| Classification | Server Component? | Data Fetching | Example |
|---------------|-------------------|---------------|---------|
| **Static Marketing** | ✅ Yes | Build-time or none | Landing page, About, Pricing |
| **Dynamic App Page** | ✅ Yes (page.tsx) | Server-side Supabase | Collection, Portfolio |
| **Interactive Widget** | ❌ Client child | TanStack Query | Search filters, price charts |
| **Modal Route** | ❌ Client | TanStack Query | Card details overlay |

**Decision tree**:
1. Does the page need SEO/metadata? → Server Component for `page.tsx`
2. Does the page need real-time data / user interaction? → Client components as children
3. Does the page show user-specific data? → Server-side fetch with `cookies()` for auth
4. Is data shared across navigations? → TanStack Query with `staleTime` in client wrapper

### Step 2 — Create Route Files

#### page.tsx (Server Component)

```typescript
// src/app/app/portfolio/page.tsx
import type { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { PortfolioContainer } from '@/components/Portfolio';
import { collectionKeys } from '@/hooks/useCollection';
import type { Database } from '@/types/database';

export const metadata: Metadata = {
  title: 'Portfolio | PokéVault',
  description: 'Track your Pokémon TCG portfolio value, ROI, and market trends across your entire collection.',
  openGraph: {
    title: 'Portfolio | PokéVault',
    description: 'Track your Pokémon TCG portfolio value, ROI, and market trends.',
    type: 'website',
  },
};

export default async function PortfolioPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // Prefetch data for client hydration
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: collectionKeys.list({ userId: session.user.id }),
    queryFn: async () => {
      const { data } = await supabase
        .from('collection_items')
        .select('*, cards(*)')
        .eq('user_id', session.user.id);
      return data ?? [];
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PortfolioContainer userId={session.user.id} />
    </HydrationBoundary>
  );
}
```

#### layout.tsx (Dashboard Layout)

```typescript
// src/app/app/layout.tsx
import type { ReactNode } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/Navigation/DashboardSidebar';
import { MobileBottomNav } from '@/components/Navigation/MobileBottomNav';
import { QueryProvider } from '@/providers/QueryProvider';
import type { Database } from '@/types/database';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-[#0f0f1a]">
        {/* Desktop sidebar */}
        <DashboardSidebar className="hidden lg:flex" />

        {/* Main content */}
        <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileBottomNav className="lg:hidden" />
      </div>
    </QueryProvider>
  );
}
```

#### loading.tsx (Skeleton)

```typescript
// src/app/app/portfolio/loading.tsx
export default function PortfolioLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        <div className="h-4 w-72 rounded-md bg-white/5" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <div className="h-4 w-20 rounded bg-white/5" />
            <div className="mt-3 h-8 w-28 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-64 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl" />

      {/* Table skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
```

#### error.tsx (Error Boundary)

```typescript
// src/app/app/portfolio/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PortfolioError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Portfolio page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold text-white">
          Something went wrong
        </h2>
        <p className="max-w-md text-sm text-slate-400">
          We couldn't load your portfolio data. This might be a temporary issue
          with our servers or your connection.
        </p>
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-6 py-3
                   font-medium text-white transition-all hover:bg-[#5558e6]
                   active:scale-95"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>

      {error.digest && (
        <p className="font-mono text-xs text-slate-600">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
```

#### not-found.tsx

```typescript
// src/app/app/cards/[id]/not-found.tsx
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function CardNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-[#fbbf24]/10 p-4">
        <Search className="h-8 w-8 text-[#fbbf24]" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold text-white">
          Card Not Found
        </h2>
        <p className="max-w-md text-sm text-slate-400">
          This card doesn't exist in your collection or might have been removed.
        </p>
      </div>

      <Link
        href="/app/collection"
        className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-6 py-3
                   font-medium text-white transition-all hover:bg-[#5558e6]"
      >
        Back to Collection
      </Link>
    </div>
  );
}
```

### Step 3 — Server vs Client Boundary

**Rule**: The `page.tsx` is always a Server Component. Interactive parts are extracted into Client Components imported by the page.

```
page.tsx (Server)
├── Metadata export          → SEO, Open Graph
├── Auth check               → Redirect if unauthenticated
├── Data prefetch             → Supabase queries for hydration
└── <HydrationBoundary>
    └── <PortfolioContainer>  (Client — 'use client')
        ├── useTanStackQuery hooks
        ├── useState / useEffect
        ├── Motion animations
        └── Event handlers
```

**When to use `'use client'`**:
| Need | Directive | Reason |
|------|-----------|--------|
| `onClick`, `onChange` | `'use client'` | Browser event handlers |
| `useState`, `useEffect` | `'use client'` | React hooks |
| TanStack Query hooks | `'use client'` | Client-side state management |
| Motion / Framer Motion | `'use client'` | Animation library |
| `localStorage`, `window` | `'use client'` | Browser APIs |
| Static JSX only | None (Server) | Default — no hydration cost |
| `cookies()`, `headers()` | None (Server) | Server-only APIs |
| Database queries | None (Server) | Server-only data access |

### Step 4 — Metadata Configuration

```typescript
// Static metadata (preferred for simple pages)
export const metadata: Metadata = {
  title: 'Collection | PokéVault',
  description: 'Browse and manage your Pokémon TCG card collection with real-time market valuations.',
};

// Dynamic metadata (for pages with variable content)
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const card = await fetchCard(params.id);
  if (!card) return { title: 'Card Not Found | PokéVault' };

  return {
    title: `${card.name} — ${card.set.name} | PokéVault`,
    description: `View ${card.name} from ${card.set.name}. Current market price, condition grades, and collection tracking.`,
    openGraph: {
      title: `${card.name} | PokéVault`,
      images: [{ url: card.images.large, width: 734, height: 1024 }],
    },
  };
}
```

### Step 5 — Styling & Layout Patterns

**Page header pattern**:
```tsx
<header className="space-y-1">
  <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
    Portfolio
  </h1>
  <p className="text-sm text-slate-400">
    Track your collection value, ROI, and market trends
  </p>
</header>
```

**Stats grid pattern**:
```tsx
<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
  <StatCard
    label="Total Value"
    value={formatCurrency(totalValue, currency)}
    icon={<DollarSign />}
    trend={+12.5}
  />
  {/* ... */}
</div>
```

**Content card pattern (glassmorphism)**:
```tsx
<section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
  <h2 className="font-display text-lg font-semibold text-white">
    Price Trends
  </h2>
  {/* Content */}
</section>
```

### Step 6 — Performance Optimization

1. **Code splitting**: Use `next/dynamic` for heavy client components:
   ```typescript
   const PriceChart = dynamic(() => import('@/components/Charts/PriceChart'), {
     loading: () => <ChartSkeleton />,
     ssr: false,
   });
   ```
2. **Image optimization**: Use `next/image` for card images:
   ```tsx
   <Image
     src={card.images.small}
     alt={card.name}
     width={245}
     height={342}
     className="rounded-lg"
     placeholder="blur"
     blurDataURL={CARD_BLUR_PLACEHOLDER}
   />
   ```
3. **Virtual scrolling**: For lists > 50 items, use `@tanstack/virtual`:
   ```typescript
   const rowVirtualizer = useVirtualizer({
     count: cards.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 80,
   });
   ```
4. **Streaming**: Use `<Suspense>` boundaries for progressive rendering:
   ```tsx
   <Suspense fallback={<StatsSkeleton />}>
     <PortfolioStats userId={session.user.id} />
   </Suspense>
   <Suspense fallback={<ChartSkeleton />}>
     <PriceTrendsChart userId={session.user.id} />
   </Suspense>
   ```

---

## Validation Steps

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | Route resolves | Navigate to URL — page renders without 404 |
| 2 | Auth guard works | Visit while logged out — redirected to `/auth/login` |
| 3 | Metadata renders | View page source — `<title>` and `<meta>` tags present |
| 4 | Loading state | Throttle network to 3G — skeleton visible during load |
| 5 | Error boundary | Force API error — error.tsx renders with retry button |
| 6 | Not-found works | Navigate to invalid ID — not-found.tsx renders |
| 7 | Mobile layout | Viewport 375px — bottom nav visible, no horizontal scroll |
| 8 | Server Component | Check RSC payload — page.tsx not in client bundle |
| 9 | Hydration match | No console hydration mismatch warnings |
| 10 | Prefetch works | Data visible immediately on navigation (no loading flash) |

---

## Quality Gates

- [ ] **Route structure**: `page.tsx` + `loading.tsx` + `error.tsx` exist for every route
- [ ] **Server Component**: `page.tsx` has no `'use client'` directive
- [ ] **Metadata**: Static or dynamic metadata exported with title + description
- [ ] **Auth guard**: Authenticated routes redirect unauthenticated users
- [ ] **Loading skeleton**: Matches the actual page layout structure
- [ ] **Error boundary**: Shows error message + retry button + error ID
- [ ] **Mobile-first**: Responsive from 320px, touch targets ≥ 44px
- [ ] **Fonts**: Headings use Space Grotesk, body uses Inter, prices use JetBrains Mono
- [ ] **Vault theme**: Background `#0f0f1a`, glassmorphism cards, vault-gold accents
- [ ] **Performance**: Code-split heavy components, images via `next/image`
- [ ] **No hydration errors**: Zero console warnings about server/client mismatch
- [ ] **Accessibility**: `<h1>` present, semantic HTML structure, skip-to-content link

---

## PokéVault Example: Creating `/app/portfolio/page.tsx`

### Requirements
- Show total portfolio value, number of cards, total investment, ROI
- Price trend chart (30d / 90d / 1y / all)
- Top 10 most valuable cards
- Value breakdown by set, rarity, language
- Support currency display: USD, EUR, BRL, JPY

### File Structure
```
src/app/app/portfolio/
├── page.tsx                    # Server: auth + prefetch + metadata
├── loading.tsx                 # Skeleton: stats grid + chart + table
└── error.tsx                   # Error boundary with retry

src/components/Portfolio/
├── index.ts                    # Barrel exports
├── PortfolioContainer.tsx      # 'use client' — orchestrates sections (~150 lines)
├── PortfolioStats.tsx          # 4 stat cards: value, cards, investment, ROI (~80 lines)
├── PriceTrendChart.tsx         # Sparkline chart with time range selector (~200 lines)
├── TopCardsTable.tsx           # Top 10 most valuable cards table (~120 lines)
├── ValueBreakdown.tsx          # Pie/bar chart by set or rarity (~150 lines)
└── CurrencySelector.tsx        # USD/EUR/BRL/JPY toggle (~60 lines)
```

### Data Flow
```
page.tsx (Server)
  └── Prefetch collection_items + cards JOIN via Supabase
      └── Dehydrate into HydrationBoundary
          └── PortfolioContainer (Client)
              ├── useCollectionItems() ← rehydrated, no loading flash
              ├── useMarketPrices()    ← separate query, staleTime: 15min
              └── usePriceHistory()   ← lazy load when chart in viewport
```

### Implementation

```typescript
// src/app/app/portfolio/page.tsx
import type { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/get-query-client';
import { PortfolioContainer } from '@/components/Portfolio';
import { collectionKeys } from '@/hooks/useCollection';

export const metadata: Metadata = {
  title: 'Portfolio | PokéVault',
  description: 'Track your complete Pokémon TCG portfolio with real-time market valuations, ROI tracking, and trend analysis.',
};

export default async function PortfolioPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const queryClient = getQueryClient();

  // Prefetch collection with cards for instant hydration
  await queryClient.prefetchQuery({
    queryKey: collectionKeys.list({ userId: session.user.id }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select(`
          *,
          cards (
            id, name, set_name, set_id, rarity,
            images, tcgplayer_prices
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PortfolioContainer userId={session.user.id} />
    </HydrationBoundary>
  );
}
```
