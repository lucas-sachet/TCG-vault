/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import type { Card, CollectionItem } from '../../types';

interface HoldingWithCard {
  holding: CollectionItem;
  card: Card;
}

interface SlotPickerModalProps {
  isOpen: boolean;
  holdings: CollectionItem[];
  cards: Card[];
  onClose: () => void;
  onSelectHolding: (holdingId: string) => void;
}

function SlotPickerCard({
  holding,
  card,
  onSelect,
}: {
  holding: CollectionItem;
  card: Card;
  onSelect: () => void;
}) {
  const primaryImageUrl = holding.frontPhotoUrl || card.imageUrl;
  const optimizedImageUrl = primaryImageUrl
    ? getOptimizedImageUrl(primaryImageUrl, 150)
    : '';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-left transition hover:border-[#FFCB05]/50"
    >
      {optimizedImageUrl ? (
        <img
          src={optimizedImageUrl}
          alt={card.name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={(event) => {
            const imageElement = event.currentTarget;
            if (primaryImageUrl && imageElement.src !== primaryImageUrl) {
              imageElement.src = primaryImageUrl;
            }
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-[8px] font-bold leading-tight text-slate-400">
          {card.name}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-1 pb-1 pt-4">
        <p className="truncate text-[8px] font-bold text-white">{card.name}</p>
      </div>
    </button>
  );
}

export function SlotPickerModal({
  isOpen,
  holdings,
  cards,
  onClose,
  onSelectHolding,
}: SlotPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const holdingsWithCards = useMemo((): HoldingWithCard[] => {
    const cardById = new Map(cards.map((card) => [card.id, card]));
    return holdings.flatMap((holding) => {
      const card = cardById.get(holding.cardId);
      return card ? [{ holding, card }] : [];
    });
  }, [holdings, cards]);

  const filteredHoldings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return holdingsWithCards;
    }
    return holdingsWithCards.filter(({ card }) =>
      card.name.toLowerCase().includes(normalizedQuery)
      || card.set.toLowerCase().includes(normalizedQuery)
      || card.number.toLowerCase().includes(normalizedQuery),
    );
  }, [holdingsWithCards, searchQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#171A21] p-4 shadow-2xl">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">Place a Holding</h3>
            <p className="text-[10px] font-mono text-slate-500">
              {filteredHoldings.length} of {holdingsWithCards.length} unslotted
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-3 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, set, or number..."
            className="w-full rounded-xl border border-slate-800 bg-[#1A1D24] py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-y-auto content-start auto-rows-max">
          {holdingsWithCards.length === 0 ? (
            <p className="col-span-3 py-6 text-center text-xs text-slate-500">
              No unslotted holdings available.
            </p>
          ) : filteredHoldings.length === 0 ? (
            <p className="col-span-3 py-6 text-center text-xs text-slate-500">
              No cards match your search.
            </p>
          ) : (
            filteredHoldings.map(({ holding, card }) => (
              <SlotPickerCard
                key={holding.id}
                holding={holding}
                card={card}
                onSelect={() => {
                  onSelectHolding(holding.id);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
