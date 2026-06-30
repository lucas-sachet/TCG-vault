'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualCardGridProps<TItem> {
  items: TItem[];
  columns?: number;
  estimateRowHeight?: number;
  renderItem: (item: TItem, index: number) => React.ReactNode;
}

export function VirtualCardGrid<TItem>({
  items,
  columns = 4,
  estimateRowHeight = 320,
  renderItem,
}: VirtualCardGridProps<TItem>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 2,
  });

  return (
    <div ref={parentRef} className="h-[70vh] overflow-auto pr-2" aria-label="Virtual card grid">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columns;
          const rowItems = items.slice(rowStartIndex, rowStartIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 absolute left-0 right-0"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowItems.map((item, columnIndex) => (
                <div key={rowStartIndex + columnIndex}>
                  {renderItem(item, rowStartIndex + columnIndex)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
