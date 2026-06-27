# Optimize Performance — Vitals & Speed Controls

## Purpose

Provides guides for improving PokéVault's runtime and bundle speed, targetting Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) and ensuring initial bundles remain below 200KB gzipped.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Bundle Map / Report | ⬚ | Output of bundle analysis tool (e.g. rollup-plugin-visualizer) |
| Performance Profiling | ⬚ | Chrome DevTools Performance profile (.json) or React Profiler trace |

---

## Outputs

1. **Lazy Loading Implementation**: Extracted dynamic imports for large panels.
2. **Virtualization wrapper**: Integrated virtualization for card grids.
3. **Map Cache Lookups**: Replaced O(n²) Array loops with Map caches.
4. **Holographic Optimization**: Optimized CSS layout/rendering loop for cards.

---

## Workflow

### Step 1 — Deconstruct O(n²) Lookups
Avoid iterating lists using `.find()` inside loops. Construct mapping lookups first:

```typescript
// BEFORE (O(n * m)):
const enrichedItems = collectionItems.map(item => {
  const cardDetails = cards.find(c => c.id === item.cardId);
  return { ...item, card: cardDetails };
});

// AFTER (O(n + m)):
const cardMap = new Map(cards.map(c => [c.id, c]));
const enrichedItems = collectionItems.map(item => {
  const cardDetails = cardMap.get(item.cardId);
  return { ...item, card: cardDetails };
});
```

### Step 2 — Lazy Load Route Components & Tabs
Do not load all tabs upfront. In Next.js App Router, layout splitting handles this. For client-rendered overlay widgets, use `next/dynamic`:

```typescript
import dynamic from 'next/dynamic';

const CardDetailsModal = dynamic(
  () => import('@/components/CardDetailsModal').then(mod => mod.CardDetailsModal),
  { ssr: false, loading: () => <ModalSkeleton /> }
);
```

### Step 3 — Virtualize Collection Lists
For lists containing > 50 cards, use `@tanstack/react-virtual` or `@tanstack/virtual` to render only visible nodes:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualGrid({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(items.length / 3), // 3 columns
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // estimated height of CardItem
    overscan: 2
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * 3;
          const rowItems = items.slice(startIndex, startIndex + 3);
          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full flex gap-4"
              style={{
                height: '280px',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {rowItems.map(item => (
                <CardItem key={item.id} card={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 4 — Debounce Inputs
Debounce searches (300ms) to avoid executing API requests or filtering computations on every key press.

---

## Validation Steps

1. Run bundle visualizer: verify initial chunk sizes are below 200KB gzipped.
2. Open React DevTools Profiler: record card adding/syncing actions, verify no unnecessary re-renders of list items occur.
3. Verify that visual changes do not cause layout shifts (CLS target < 0.1).

---

## Quality Gates

- [ ] Initial bundle size is under 200KB gzipped.
- [ ] Render loops do not exceed O(n) complexity.
- [ ] Dynamic imports are configured for all modals and secondary tabs.
- [ ] Scrolling performance of the main Collection remains at 60 FPS.
