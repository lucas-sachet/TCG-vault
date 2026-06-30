/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import type { Card, CollectionItem } from '../../types';

interface UnslottedHoldingsPanelProps {
  holdings: CollectionItem[];
  cards: Card[];
  showAllUnslotted: boolean;
  onToggleShowAll: () => void;
  onDragHolding: (event: React.DragEvent, holdingId: string) => void;
  onSelectHolding: (holdingId: string, cardId: string) => void;
  onDropHoldingFromSlot: (
    holdingId: string,
    binderId: string,
    pageNumber: number,
    slotNumber: number,
  ) => void;
}

export function UnslottedHoldingsPanel({
  holdings,
  cards,
  showAllUnslotted,
  onToggleShowAll,
  onDragHolding,
  onSelectHolding,
  onDropHoldingFromSlot,
}: UnslottedHoldingsPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragOver(false);

    const holdingId = event.dataTransfer.getData('text/holding-id');
    const sourceBinderId = event.dataTransfer.getData('text/source-binder-id');
    const sourcePage = event.dataTransfer.getData('text/source-page');
    const sourceSlot = event.dataTransfer.getData('text/source-slot');

    if (!holdingId || sourceBinderId === 'pool' || sourceBinderId === '') {
      return;
    }

    if (sourcePage === '' || sourceSlot === '') {
      return;
    }

    onDropHoldingFromSlot(
      holdingId,
      sourceBinderId,
      Number(sourcePage),
      Number(sourceSlot),
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
          Unslotted Holdings — drag between pockets and here
        </span>
        <button
          type="button"
          onClick={onToggleShowAll}
          className="shrink-0 text-[9px] font-mono uppercase tracking-widest text-indigo-400 transition hover:text-indigo-300"
        >
          {showAllUnslotted ? 'This binder only' : 'Show all unslotted'}
        </button>
      </div>
      <div
        className={`rounded-2xl border border-dashed p-3 transition-colors ${
          isDragOver
            ? 'border-[#FFCB05]/60 bg-[#FFCB05]/5'
            : 'border-slate-800 bg-[#0b0c11]/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {holdings.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-500">
            {isDragOver
              ? 'Release to remove from pocket'
              : showAllUnslotted
                ? 'All holdings are placed in pockets. Drag a holding here to unslot it.'
                : 'No unslotted holdings for this binder. Tap an empty pocket or show all unslotted.'}
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {holdings.map((holding) => {
              const card = cards.find((entry) => entry.id === holding.cardId);
              if (!card) return null;
              const primaryImageUrl = holding.frontPhotoUrl || card.imageUrl;
              const imageUrl = primaryImageUrl ? getOptimizedImageUrl(primaryImageUrl, 120) : '';

              return (
                <button
                  key={holding.id}
                  type="button"
                  draggable
                  onDragStart={(event) => onDragHolding(event, holding.id)}
                  onClick={() => onSelectHolding(holding.id, card.id)}
                  className="relative aspect-[2.5/3.5] w-20 shrink-0 cursor-grab overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-indigo-500/40 active:cursor-grabbing"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={card.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        const imageElement = event.currentTarget;
                        if (primaryImageUrl && imageElement.src !== primaryImageUrl) {
                          imageElement.src = primaryImageUrl;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-1 text-center text-[7px] font-bold text-slate-400">
                      {card.name}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1 pb-0.5 pt-3">
                    <p className="truncate text-[7px] font-bold text-white">{card.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
