/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { isMvpFeatureEnabled } from '../../config/mvpFeatures';
import type { Card, CollectionItem } from '../../types';
import { BinderPocketActionSheet } from './BinderPocketActionSheet';

interface BinderPocketProps {
  slotNumber: number;
  pageNumber: number;
  holding: CollectionItem | null;
  card: Card | null;
  marketPrice: number;
  currencySymbol: string;
  isDragOver: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragStart: (event: React.DragEvent) => void;
  onClick: () => void;
  onClearPocket: () => void;
  onRequestReplaceHolding: () => void;
  onViewHolding: () => void;
}

const LONG_PRESS_MS = 500;

export function BinderPocket({
  holding,
  card,
  marketPrice,
  currencySymbol,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onClick,
  onClearPocket,
  onRequestReplaceHolding,
  onViewHolding,
}: BinderPocketProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);

  const imageUrl = card
    ? getOptimizedImageUrl(holding?.frontPhotoUrl || card.imageUrl, 200)
    : null;

  const pocketLabel = holding && card
    ? `Pocket with ${card.name}`
    : 'Empty pocket — tap to place a holding';

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handlePointerDown() {
    if (!holding || !card) {
      return;
    }
    didLongPressRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      setIsActionSheetOpen(true);
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    clearLongPressTimer();
  }

  function handleContextMenu(event: React.MouseEvent) {
    if (!holding || !card) {
      return;
    }
    event.preventDefault();
    setIsActionSheetOpen(true);
  }

  function handleClick() {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    onClick();
  }

  return (
    <>
      <button
        type="button"
        draggable={Boolean(holding)}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
        aria-label={pocketLabel}
        className={`binder-pocket group relative aspect-[2.5/3.5] overflow-hidden rounded-xl border-2 transition-all ${
          isDragOver
            ? 'scale-[1.02] border-[#FFCB05] bg-[#FFCB05]/10'
            : holding
              ? 'cursor-grab border-slate-700 bg-slate-900 hover:border-indigo-500/50 active:cursor-grabbing'
              : 'border-dashed border-slate-700/80 bg-[#0a0b10] hover:border-slate-600'
        }`}
      >
        {holding && card && imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={card.name}
              className="binder-pocket-image h-full w-full object-cover"
              draggable={false}
              referrerPolicy="no-referrer"
            />
            <div
              className="binder-pocket-sheen pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 pt-6">
              <p className="truncate text-left text-[9px] font-bold text-white">{card.name}</p>
              {isMvpFeatureEnabled('pocketPriceBadge') && marketPrice > 0 && (
                <p className="text-left font-mono text-[8px] text-[#FFCB05]">
                  {currencySymbol}{marketPrice.toFixed(2)}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-[80%] w-[70%] items-center justify-center rounded-lg border border-slate-800/60 bg-slate-900/30">
              <Plus className="h-5 w-5 text-slate-700 transition group-hover:text-slate-500" />
            </div>
          </div>
        )}
      </button>

      {holding && card && (
        <BinderPocketActionSheet
          isOpen={isActionSheetOpen}
          cardName={card.name}
          onClose={() => setIsActionSheetOpen(false)}
          onViewHolding={onViewHolding}
          onRemoveFromPocket={onClearPocket}
          onPlaceDifferent={onRequestReplaceHolding}
        />
      )}
    </>
  );
}
