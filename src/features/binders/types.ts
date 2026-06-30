/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BinderSlot, Card, CollectionItem, Binder } from '../../types';

export interface BindersTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  binders: Binder[];
  binderSlots: BinderSlot[];
  selectedBinderId: string | null;
  onSelectBinder: (binderId: string | null) => void;
  onAddBinder: (name: string, description?: string) => string;
  onUpdateBinder: (
    binderId: string,
    updates: { name?: string; description?: string; coverCardId?: string | null },
  ) => void;
  onDeleteBinder: (binderId: string) => void;
  onViewHolding: (holdingId: string, cardId: string) => void;
  onOpenAddModal: () => void;
  currencySymbol?: string;
  getSlotHoldingId: (binderId: string, pageNumber: number, slotNumber: number) => string | null;
  getSlottedHoldingIds: () => Set<string>;
  getBinderPageCount: (binderId: string) => number;
  assignHoldingToSlot: (
    binderId: string,
    pageNumber: number,
    slotNumber: number,
    holdingId: string,
  ) => void;
  clearSlot: (binderId: string, pageNumber: number, slotNumber: number) => void;
  moveHoldingBetweenSlots: (
    sourceBinderId: string,
    sourcePage: number,
    sourceSlot: number,
    targetBinderId: string,
    targetPage: number,
    targetSlot: number,
  ) => void;
}

export const SLOTS_PER_PAGE = 9;
export const GRID_COLUMNS = 3;
