# Create Component — React Component Engineering

## Purpose

Guides the creation of production-quality React components for PokéVault, enforcing the 300-line limit, strict TypeScript interfaces with JSDoc, composition-over-inheritance patterns, vault-dark theme styling with Tailwind v4, Motion animations, and WCAG 2.1 AA accessibility. Every component must be independently testable, barrel-exported, and designed for the mobile-first collector experience.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Component name | ✅ | PascalCase name (e.g., `CardItem`, `PriceChart`, `AddCardModal`) |
| Component type | ✅ | `presentational`, `container`, `layout`, `form`, `modal`, `chart` |
| Props specification | ✅ | What data the component receives |
| Domain | ✅ | `collection`, `wishlist`, `binders`, `portfolio`, `market`, `goals`, `settings`, `shared` |
| Interactivity | ✅ | `static` (Server Component), `interactive` (Client Component) |
| Parent component | ⬚ | Where this component will be used |
| Animation requirements | ⬚ | Specific Motion animations needed |
| Responsive breakpoints | ⬚ | Special layout changes beyond default mobile-first |

---

## Outputs

```
src/components/<Domain>/<ComponentName>/
├── index.ts                        # Barrel export (named exports only)
├── <ComponentName>.tsx              # Main component (≤ 300 lines)
├── <ComponentName>.types.ts         # Props interface + internal types (if complex)
├── <ComponentName>.utils.ts         # Helper functions (if needed)
├── <ComponentName>.skeleton.tsx     # Loading skeleton variant
└── __tests__/
    └── <ComponentName>.test.tsx     # Vitest + RTL tests
```

For simple components (< 100 lines total), the flat structure is acceptable:
```
src/components/<Domain>/
├── <ComponentName>.tsx
└── index.ts                        # Add to existing barrel
```

---

## Workflow

### Step 1 — Component Classification

| Type | `'use client'`? | Data Fetching | State | Examples |
|------|-----------------|---------------|-------|---------|
| **Presentational** | Only if interactive | None — receives via props | Minimal local state | `CardItem`, `PriceBadge`, `QualityChip` |
| **Container** | ✅ Always | TanStack Query hooks | Manages child state | `CollectionContainer`, `WishlistContainer` |
| **Layout** | Rarely | None | None | `PageHeader`, `StatsGrid`, `GlassCard` |
| **Form** | ✅ Always | Mutation hooks | Form state (controlled) | `AddCardForm`, `EditTradeForm` |
| **Modal** | ✅ Always | Query + Mutation | Open/close + form state | `CardDetailsModal`, `CreateBinderModal` |
| **Chart** | ✅ Always | Receives data via props | Tooltip/hover state | `PriceSparkline`, `ValueBreakdownChart` |

### Step 2 — Define Props Interface

Every exported component must have a typed props interface with JSDoc comments:

```typescript
// src/components/Collection/CardItem/CardItem.types.ts

import type { Card, CollectionItem } from '@/types';
import type { CardLanguage, CardQuality, GradeType } from '@/types/enums';

/**
 * Props for the CardItem component.
 * Displays a single Pokémon TCG card with price, quality badge, and grading info.
 */
export interface CardItemProps {
  /** The card metadata (name, image, set, rarity) */
  card: Card;

  /** The user's specific copy of this card with condition and purchase data */
  collectionItem: CollectionItem;

  /** Current market price in USD (from tcgplayer.prices) */
  currentPriceUsd: number | null;

  /** Display currency for price conversion */
  displayCurrency: 'USD' | 'EUR' | 'BRL' | 'JPY';

  /** Whether the card is currently selected (for batch operations) */
  isSelected?: boolean;

  /** Callback when user clicks the card to view details */
  onViewDetails: (cardId: string) => void;

  /** Callback when user toggles card selection */
  onToggleSelect?: (cardId: string, selected: boolean) => void;

  /** Visual variant */
  variant?: 'grid' | 'list' | 'compact';

  /** Additional CSS classes */
  className?: string;
}

/**
 * Internal type for computed card display data.
 * Pre-calculated from CardItem props to avoid re-computation in render.
 */
export interface CardDisplayData {
  displayPrice: string;
  roi: number | null;
  roiFormatted: string;
  qualityLabel: string;
  gradeLabel: string | null;
  rarityColor: string;
}
```

### Step 3 — Implement Component

#### Template: Presentational Component

```typescript
// src/components/Collection/CardItem/CardItem.tsx
'use client';

import { memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';
import { getQualityLabel, getGradeLabel, getRarityColor } from '@/utils/card';
import type { CardItemProps, CardDisplayData } from './CardItem.types';

const CARD_BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg==';

/** Displays a single Pokémon TCG card with price, quality badge, and grading info. */
export const CardItem = memo(function CardItem({
  card,
  collectionItem,
  currentPriceUsd,
  displayCurrency,
  isSelected = false,
  onViewDetails,
  onToggleSelect,
  variant = 'grid',
  className,
}: CardItemProps) {
  // Pre-compute display data
  const display = useMemo<CardDisplayData>(() => ({
    displayPrice: currentPriceUsd
      ? formatCurrency(currentPriceUsd, displayCurrency)
      : '—',
    roi: currentPriceUsd && collectionItem.purchasePrice
      ? ((currentPriceUsd - collectionItem.purchasePrice) / collectionItem.purchasePrice) * 100
      : null,
    roiFormatted: '', // computed below
    qualityLabel: getQualityLabel(collectionItem.quality),
    gradeLabel: collectionItem.gradeType !== 'Raw'
      ? getGradeLabel(collectionItem.gradeType, collectionItem.gradeValue)
      : null,
    rarityColor: getRarityColor(card.rarity),
  }), [card, collectionItem, currentPriceUsd, displayCurrency]);

  const handleClick = useCallback(() => {
    onViewDetails(card.id);
  }, [card.id, onViewDetails]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onViewDetails(card.id);
      }
    },
    [card.id, onViewDetails],
  );

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleSelect?.(card.id, !isSelected);
    },
    [card.id, isSelected, onToggleSelect],
  );

  if (variant === 'list') {
    return <CardItemListVariant /* ... */ />;
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative cursor-pointer rounded-2xl border border-white/10',
        'bg-white/5 p-3 backdrop-blur-xl transition-colors',
        'hover:border-[#fbbf24]/30 hover:bg-white/8',
        isSelected && 'border-[#6366f1] bg-[#6366f1]/10',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${card.name} from ${card.set?.name ?? 'unknown set'}`}
      aria-selected={isSelected}
    >
      {/* Selection checkbox */}
      {onToggleSelect && (
        <button
          onClick={handleSelect}
          className="absolute left-2 top-2 z-10 rounded-full bg-black/50 p-1.5
                     opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={isSelected ? `Deselect ${card.name}` : `Select ${card.name}`}
        >
          <Star
            className={cn('h-4 w-4', isSelected ? 'fill-[#fbbf24] text-[#fbbf24]' : 'text-white/60')}
          />
        </button>
      )}

      {/* Card image with 3D tilt effect */}
      <div className="perspective-[800px]">
        <div className="transform-gpu transition-transform duration-300 group-hover:rotate-y-3">
          <Image
            src={card.images?.small ?? '/placeholder-card.webp'}
            alt={card.name}
            width={245}
            height={342}
            className="w-full rounded-lg"
            placeholder="blur"
            blurDataURL={CARD_BLUR_PLACEHOLDER}
            loading="lazy"
          />

          {/* Holographic sheen overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-lg opacity-0
                       bg-gradient-to-br from-transparent via-white/10 to-transparent
                       transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>

      {/* Card info */}
      <div className="mt-3 space-y-1.5">
        <h3 className="truncate font-sans text-sm font-medium text-white">
          {card.name}
        </h3>

        <p className="truncate text-xs text-slate-400">
          {card.set?.name}
        </p>

        {/* Price + ROI */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-[#fbbf24]">
            {display.displayPrice}
          </span>
          {display.roi !== null && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium',
                display.roi >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {display.roi >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(display.roi).toFixed(1)}%
            </span>
          )}
        </div>

        {/* Quality + Grade badges */}
        <div className="flex items-center gap-1.5">
          <span
            className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]
                       font-medium uppercase tracking-wider text-slate-300"
          >
            {display.qualityLabel}
          </span>
          {display.gradeLabel && (
            <span
              className="rounded-md bg-[#6366f1]/20 px-1.5 py-0.5 text-[10px]
                         font-medium text-[#a5b4fc]"
            >
              {display.gradeLabel}
            </span>
          )}
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-[10px]"
            style={{ backgroundColor: `${display.rarityColor}20`, color: display.rarityColor }}
          >
            {collectionItem.language}
          </span>
        </div>
      </div>
    </motion.article>
  );
});
```

### Step 4 — Create Loading Skeleton

```typescript
// src/components/Collection/CardItem/CardItem.skeleton.tsx
import { cn } from '@/lib/utils';

interface CardItemSkeletonProps {
  variant?: 'grid' | 'list';
  className?: string;
}

export function CardItemSkeleton({ variant = 'grid', className }: CardItemSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl border border-white/5 bg-white/5 p-3',
        className,
      )}
    >
      {/* Image placeholder */}
      <div className="aspect-[245/342] rounded-lg bg-white/5" />

      {/* Text placeholders */}
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-white/5" />
          <div className="h-4 w-12 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
```

### Step 5 — Barrel Export

```typescript
// src/components/Collection/CardItem/index.ts
export { CardItem } from './CardItem';
export { CardItemSkeleton } from './CardItem.skeleton';
export type { CardItemProps, CardDisplayData } from './CardItem.types';
```

### Step 6 — Write Tests

```typescript
// src/components/Collection/CardItem/__tests__/CardItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CardItem } from '../CardItem';
import { mockCard, mockCollectionItem } from '@/__mocks__/card';

describe('CardItem', () => {
  const defaultProps = {
    card: mockCard,
    collectionItem: mockCollectionItem,
    currentPriceUsd: 25.50,
    displayCurrency: 'USD' as const,
    onViewDetails: vi.fn(),
  };

  it('renders card name and set name', () => {
    render(<CardItem {...defaultProps} />);
    expect(screen.getByText(mockCard.name)).toBeInTheDocument();
    expect(screen.getByText(mockCard.set.name)).toBeInTheDocument();
  });

  it('displays formatted price in vault-gold', () => {
    render(<CardItem {...defaultProps} />);
    const price = screen.getByText('$25.50');
    expect(price).toHaveClass('text-[#fbbf24]');
  });

  it('shows positive ROI in green', () => {
    render(
      <CardItem
        {...defaultProps}
        collectionItem={{ ...mockCollectionItem, purchasePrice: 20 }}
        currentPriceUsd={25}
      />,
    );
    expect(screen.getByText('25.0%')).toHaveClass('text-emerald-400');
  });

  it('shows negative ROI in red', () => {
    render(
      <CardItem
        {...defaultProps}
        collectionItem={{ ...mockCollectionItem, purchasePrice: 30 }}
        currentPriceUsd={25}
      />,
    );
    expect(screen.getByText('16.7%')).toHaveClass('text-red-400');
  });

  it('calls onViewDetails when clicked', async () => {
    const onViewDetails = vi.fn();
    render(<CardItem {...defaultProps} onViewDetails={onViewDetails} />);

    await userEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(onViewDetails).toHaveBeenCalledWith(mockCard.id);
  });

  it('is keyboard accessible with Enter key', async () => {
    const onViewDetails = vi.fn();
    render(<CardItem {...defaultProps} onViewDetails={onViewDetails} />);

    const article = screen.getByRole('button');
    article.focus();
    await userEvent.keyboard('{Enter}');
    expect(onViewDetails).toHaveBeenCalledWith(mockCard.id);
  });

  it('displays quality badge', () => {
    render(<CardItem {...defaultProps} />);
    expect(screen.getByText('NM')).toBeInTheDocument();
  });

  it('displays grade badge for graded cards', () => {
    render(
      <CardItem
        {...defaultProps}
        collectionItem={{ ...mockCollectionItem, gradeType: 'PSA', gradeValue: '10' }}
      />,
    );
    expect(screen.getByText('PSA 10')).toBeInTheDocument();
  });

  it('hides grade badge for raw cards', () => {
    render(
      <CardItem
        {...defaultProps}
        collectionItem={{ ...mockCollectionItem, gradeType: 'Raw' }}
      />,
    );
    expect(screen.queryByText(/PSA|CGC|BGS/)).not.toBeInTheDocument();
  });

  it('displays language badge', () => {
    render(<CardItem {...defaultProps} />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('renders dash when price is null', () => {
    render(<CardItem {...defaultProps} currentPriceUsd={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
```

---

## Composition Patterns

### Pattern 1: Container + Presentational

```
<CollectionContainer>          ← 'use client', hooks, state
  <CollectionHeader />         ← Pure UI, receives filter state via props
  <CollectionGrid>             ← Layout component with virtual scrolling
    <CardItem />               ← Presentational, memo'd
    <CardItem />
  </CollectionGrid>
  <CollectionEmptyState />     ← Shown when items.length === 0
</CollectionContainer>
```

### Pattern 2: Compound Component

```typescript
// Usage:
<StatCard>
  <StatCard.Icon><DollarSign /></StatCard.Icon>
  <StatCard.Value>$12,450</StatCard.Value>
  <StatCard.Label>Total Value</StatCard.Label>
  <StatCard.Trend value={+12.5} />
</StatCard>
```

### Pattern 3: Render Prop / Slot

```typescript
// For flexible card layouts:
<CardGrid
  items={cards}
  renderItem={(card) => <CardItem card={card} />}
  renderEmpty={() => <EmptyState action="Add your first card" />}
  renderLoading={() => <CardItemSkeleton />}
/>
```

### Pattern 4: Modal with Portal

```typescript
'use client';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
  const trapRef = useFocusTrap(isOpen);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-card-title"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg
                       rounded-2xl border border-white/10 bg-[#1b202c]
                       p-6 shadow-2xl backdrop-blur-xl sm:inset-x-auto"
          >
            {/* Content */}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
```

---

## Styling Reference — Vault Dark Theme

### Color Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `vault-dark` | `#0f0f1a` | Page background |
| `vault-surface` | `#1b202c` | Card/panel backgrounds |
| `vault-surface-2` | `#222938` | Elevated surfaces, hover states |
| `vault-gold` | `#fbbf24` | Primary accent — prices, CTAs, highlights |
| `vault-accent` | `#6366f1` | Secondary accent — buttons, links, active states |
| `vault-accent-light` | `#a5b4fc` | Accent text on dark backgrounds |
| `text-primary` | `#f8fafc` | Primary text (white-ish) |
| `text-secondary` | `#94a3b8` | Secondary text (slate-400) |
| `text-muted` | `#64748b` | Muted text (slate-500) |
| `border-subtle` | `rgba(255,255,255,0.1)` | Default borders |
| `border-hover` | `rgba(251,191,36,0.3)` | Gold border on hover |

### Typography
| Element | Font | Class |
|---------|------|-------|
| Headings | Space Grotesk | `font-display` |
| Body text | Inter | `font-sans` |
| Prices, codes | JetBrains Mono | `font-mono` |

### Glassmorphism Card

```tsx
<div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
  {/* content */}
</div>
```

### 3D Card Tilt

```css
.perspective-card {
  perspective: 800px;
}
.perspective-card:hover .card-inner {
  transform: rotateY(3deg) rotateX(-2deg);
}
```

### Holographic Sheen

```tsx
<div className="pointer-events-none absolute inset-0 rounded-lg opacity-0
               bg-gradient-to-br from-transparent via-white/10 to-transparent
               transition-opacity group-hover:opacity-100" />
```

---

## Animation Reference — Motion Library

### Entry Animation (Cards)
```typescript
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
};
```

### Price Change Flash
```typescript
const priceFlash = {
  increase: { color: ['#10b981', '#fbbf24'], transition: { duration: 0.8 } },
  decrease: { color: ['#ef4444', '#fbbf24'], transition: { duration: 0.8 } },
};
```

### Modal Enter/Exit
```typescript
const modalVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.15 } },
};
```

### List Stagger
```typescript
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};
```

---

## Accessibility Checklist

- [ ] All interactive elements have `aria-label` or visible label text
- [ ] `role="button"` on non-button clickable elements with `tabIndex={0}`
- [ ] `onKeyDown` handler for Enter and Space on custom clickable elements
- [ ] `aria-selected` on selectable items
- [ ] `aria-expanded` on collapsible sections
- [ ] Modals have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Focus trapped in modals via `useFocusTrap` hook
- [ ] Color contrast ≥ 4.5:1 (white text on `#0f0f1a` = 15.4:1 ✅)
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] No information conveyed by color alone (always pair with icon/text)
- [ ] Images have descriptive `alt` text
- [ ] Form inputs have associated `<label>` elements

---

## Validation Steps

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | Component renders | Vitest test passes with `render(<Component />)` |
| 2 | Line count ≤ 300 | `wc -l <file>` returns ≤ 300 |
| 3 | No `any` types | `npx tsc --noEmit` passes |
| 4 | Named export only | Barrel export uses `export { X }`, not `export default` |
| 5 | Props have JSDoc | Every prop in interface has `/** */` comment |
| 6 | Keyboard accessible | Tab to element → Enter/Space activates |
| 7 | Mobile responsive | 375px viewport — no overflow, touch targets ≥ 44px |
| 8 | Skeleton exists | Loading variant renders with correct aspect ratio |
| 9 | Memo'd if pure | Presentational components wrapped in `memo()` |
| 10 | Animation smooth | 60fps on mid-range device (Chrome Performance tab) |

---

## Quality Gates

- [ ] **Line Count**: ≤ 300 lines per `.tsx` file
- [ ] **Type Safety**: Zero `any`, zero untyped event handlers
- [ ] **JSDoc**: All exported props interfaces fully documented
- [ ] **Named Exports**: No `export default` — barrel export via `index.ts`
- [ ] **Memoization**: Presentational components use `memo()`, callbacks use `useCallback`
- [ ] **Tests**: ≥ 1 render test, ≥ 1 interaction test, ≥ 1 edge case test
- [ ] **Skeleton**: Loading variant exists and matches layout structure
- [ ] **Accessibility**: All checklist items pass
- [ ] **Responsive**: Works from 320px to 1920px
- [ ] **Vault Theme**: Uses vault-dark tokens, not hardcoded random colors
- [ ] **Animation**: Uses Motion library, not raw CSS `@keyframes` for complex animations
- [ ] **Performance**: No unnecessary re-renders (React DevTools Profiler)

---

## PokéVault Examples

### Example 1: PriceBadge (Simple Presentational)

```typescript
// src/components/shared/PriceBadge.tsx (≤ 40 lines)
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceBadgeProps {
  /** Price formatted in display currency (e.g., "$25.50") */
  price: string;
  /** Percentage change (positive = green, negative = red) */
  change?: number | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function PriceBadge({ price, change, size = 'md' }: PriceBadgeProps) {
  const TrendIcon = !change ? Minus : change >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className={cn('flex items-center gap-1.5', sizeClasses[size])}>
      <span className="font-mono font-semibold text-[#fbbf24]">{price}</span>
      {change != null && (
        <span className={cn('flex items-center gap-0.5 text-xs font-medium',
          change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          <TrendIcon className="h-3 w-3" />
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

const sizeClasses = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
```

### Example 2: AddCardModal (Complex Form)

```
src/components/Collection/AddCardModal/
├── index.ts                     # export { AddCardModal }
├── AddCardModal.tsx             # ~250 lines — portal, backdrop, form orchestration
├── AddCardModal.types.ts        # Props + form state types
├── CardSearchInput.tsx          # ~100 lines — debounced search with Pokemon TCG API
├── QuantityQualitySelector.tsx  # ~80 lines — quantity spinner, quality dropdown
├── GradeSelector.tsx            # ~70 lines — grade type + grade value inputs
└── __tests__/
    └── AddCardModal.test.tsx
```

### Example 3: PriceChart (Chart Component)

```
src/components/Portfolio/PriceChart/
├── index.ts
├── PriceChart.tsx               # ~200 lines — sparkline with hover tooltip
├── PriceChart.types.ts          # PricePoint[], TimeRange, ChartConfig
├── PriceChart.utils.ts          # Scale calculations, date formatting
├── TimeRangeSelector.tsx        # ~50 lines — 30d/90d/1y/all toggle
└── __tests__/
    └── PriceChart.test.tsx
```
