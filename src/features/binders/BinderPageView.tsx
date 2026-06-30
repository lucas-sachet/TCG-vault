/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BinderSlot, Card, CollectionItem } from '../../types';
import { BinderPocket } from './BinderPocket';
import { BinderStatsBanner } from './BinderStatsBanner';
import {
  getBinderSlottedCount,
  getBinderTotalValue,
  getPageFillStats,
} from './binderStats';
import { GRID_COLUMNS, SLOTS_PER_PAGE } from './types';

interface BinderPageViewProps {
  binderId: string;
  binderName: string;
  binderSlots: BinderSlot[];
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  getSlotHoldingId: (pageNumber: number, slotNumber: number) => string | null;
  collectionItems: CollectionItem[];
  cards: Card[];
  marketPrices: Record<string, number>;
  currencySymbol: string;
  onAssignHolding: (pageNumber: number, slotNumber: number, holdingId: string) => void;
  onMoveHolding: (
    sourcePage: number,
    sourceSlot: number,
    targetPage: number,
    targetSlot: number,
  ) => void;
  onViewHolding: (holdingId: string, cardId: string) => void;
  onRequestSlotPick: (pageNumber: number, slotNumber: number) => void;
  onClearPocket: (pageNumber: number, slotNumber: number) => void;
  onRequestReplaceHolding: (pageNumber: number, slotNumber: number) => void;
}

export function BinderPageView({
  binderId,
  binderName,
  binderSlots,
  currentPage,
  pageCount,
  onPageChange,
  getSlotHoldingId,
  collectionItems,
  cards,
  marketPrices,
  currencySymbol,
  onAssignHolding,
  onMoveHolding,
  onViewHolding,
  onRequestSlotPick,
  onClearPocket,
  onRequestReplaceHolding,
}: BinderPageViewProps) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const maxNavigablePage = pageCount;
  const visiblePageCount = Math.max(pageCount, currentPage + 1);
  const pageFillStats = getPageFillStats(binderId, currentPage, binderSlots, SLOTS_PER_PAGE);
  const binderSlottedCount = getBinderSlottedCount(binderId, binderSlots);
  const binderTotalValue = getBinderTotalValue(
    binderId,
    binderSlots,
    collectionItems,
    cards,
    marketPrices,
  );

  function resolveHolding(holdingId: string | null): CollectionItem | null {
    if (!holdingId) return null;
    return collectionItems.find((item) => item.id === holdingId) ?? null;
  }

  function resolveCard(holding: CollectionItem | null): Card | null {
    if (!holding) return null;
    return cards.find((card) => card.id === holding.cardId) ?? null;
  }

  function handleDrop(slotNumber: number, event: React.DragEvent) {
    event.preventDefault();
    setDragOverSlot(null);
    const holdingId = event.dataTransfer.getData('text/holding-id');
    const sourcePage = event.dataTransfer.getData('text/source-page');
    const sourceSlot = event.dataTransfer.getData('text/source-slot');
    const sourceBinderId = event.dataTransfer.getData('text/source-binder-id');

    if (!holdingId) return;

    if (sourceBinderId === binderId && sourcePage !== '' && sourceSlot !== '') {
      onMoveHolding(Number(sourcePage), Number(sourceSlot), currentPage, slotNumber);
      return;
    }

    onAssignHolding(currentPage, slotNumber, holdingId);
  }

  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">{binderName}</h2>
          <p className="text-xs text-slate-500">
            Page {currentPage + 1} of {visiblePageCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={currentPage >= maxNavigablePage}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <BinderStatsBanner
        pageFillStats={pageFillStats}
        binderSlottedCount={binderSlottedCount}
        binderTotalValue={binderTotalValue}
        currencySymbol={currencySymbol}
      />

      {visiblePageCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: visiblePageCount }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              onClick={() => onPageChange(pageIndex)}
              aria-label={`Go to page ${pageIndex + 1}`}
              className={`h-2 w-2 shrink-0 rounded-full transition ${
                pageIndex === currentPage
                  ? 'bg-[#FFCB05] scale-125'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      )}

      <div
        className="relative rounded-3xl border border-slate-850 bg-[#12141c] p-4 md:p-6"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(30,35,50,0.35) 0px, rgba(30,35,50,0.35) 12px, transparent 12px)',
        }}
      >
        <div
          className="grid gap-3 md:gap-4"
          style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: SLOTS_PER_PAGE }, (_, slotNumber) => {
            const holdingId = getSlotHoldingId(currentPage, slotNumber);
            const holding = resolveHolding(holdingId);
            const card = resolveCard(holding);
            const marketPrice = card ? (marketPrices[card.id] ?? 0) : 0;

            return (
              <BinderPocket
                key={slotNumber}
                slotNumber={slotNumber}
                pageNumber={currentPage}
                holding={holding}
                card={card}
                marketPrice={marketPrice}
                currencySymbol={currencySymbol}
                isDragOver={dragOverSlot === slotNumber}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverSlot(slotNumber);
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(event) => handleDrop(slotNumber, event)}
                onDragStart={(event) => {
                  if (!holding) return;
                  event.dataTransfer.setData('text/holding-id', holding.id);
                  event.dataTransfer.setData('text/source-page', String(currentPage));
                  event.dataTransfer.setData('text/source-slot', String(slotNumber));
                  event.dataTransfer.setData('text/source-binder-id', binderId);
                }}
                onClick={() => {
                  if (holding && card) {
                    onViewHolding(holding.id, card.id);
                    return;
                  }
                  onRequestSlotPick(currentPage, slotNumber);
                }}
                onClearPocket={() => onClearPocket(currentPage, slotNumber)}
                onRequestReplaceHolding={() => onRequestReplaceHolding(currentPage, slotNumber)}
                onViewHolding={() => {
                  if (holding && card) {
                    onViewHolding(holding.id, card.id);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
