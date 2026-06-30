'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualWishlistListProps<TItem> {
  items: TItem[];
  estimateRowHeight?: number;
  renderItem: (item: TItem, index: number) => React.ReactNode;
}

export function VirtualWishlistList<TItem>({
  items,
  estimateRowHeight = 180,
  renderItem,
}: VirtualWishlistListProps<TItem>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 4,
  });

  return (
    <div ref={parentRef} className="h-[70vh] overflow-auto pr-2" aria-label="Virtual wishlist">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute left-0 right-0 px-1"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
