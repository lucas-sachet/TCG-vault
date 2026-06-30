/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import type { Card, CollectionItem } from '../../types';

interface CoverCardPickerModalProps {
  isOpen: boolean;
  holdings: CollectionItem[];
  cards: Card[];
  currentCoverCardId?: string;
  onClose: () => void;
  onSelectCover: (cardId: string) => void;
  onClearCover: () => void;
}

export function CoverCardPickerModal({
  isOpen,
  holdings,
  cards,
  currentCoverCardId,
  onClose,
  onSelectCover,
  onClearCover,
}: CoverCardPickerModalProps) {
  const ownedCards = useMemo(() => {
    const cardById = new Map(cards.map((card) => [card.id, card]));
    const seenCardIds = new Set<string>();

    return holdings.flatMap((holding) => {
      if (seenCardIds.has(holding.cardId)) {
        return [];
      }
      seenCardIds.add(holding.cardId);
      const card = cardById.get(holding.cardId);
      return card ? [{ card, holding }] : [];
    });
  }, [holdings, cards]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#171A21] p-4 shadow-2xl">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">Set Cover Card</h3>
            <p className="text-[10px] font-mono text-slate-500">
              Choose a catalog card from this binder
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {currentCoverCardId && (
          <button
            type="button"
            onClick={() => {
              onClearCover();
              onClose();
            }}
            className="mb-3 shrink-0 rounded-xl border border-slate-800 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 transition hover:border-slate-700 hover:text-white"
          >
            Remove cover
          </button>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-y-auto content-start auto-rows-max">
          {ownedCards.length === 0 ? (
            <p className="col-span-3 py-6 text-center text-xs text-slate-500">
              Place holdings in this binder to pick a cover card.
            </p>
          ) : (
            ownedCards.map(({ card, holding }) => {
              const primaryImageUrl = holding.frontPhotoUrl || card.imageUrl;
              const imageUrl = primaryImageUrl ? getOptimizedImageUrl(primaryImageUrl, 150) : '';
              const isSelected = card.id === currentCoverCardId;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    onSelectCover(card.id);
                    onClose();
                  }}
                  className={`relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl border bg-slate-900 text-left transition ${
                    isSelected
                      ? 'border-[#FFCB05] ring-2 ring-[#FFCB05]/30'
                      : 'border-slate-800 hover:border-[#FFCB05]/50'
                  }`}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={card.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[8px] font-bold text-slate-400">
                      {card.name}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-1 pb-1 pt-4">
                    <p className="truncate text-[8px] font-bold text-white">{card.name}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
