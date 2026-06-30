/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Card, CollectionItem, WishlistItem, CardQuality } from '../../types';

export interface TrainerLabTabProps {
  cards: Card[];
  collectionItems: CollectionItem[];
  marketPrices: Record<string, number>;
  onViewCardDetails: (cardId: string) => void;
  onAddHolding: (holding: CollectionItem) => void;
  onUpdateCollectionItemQuality: (id: string, quality: CardQuality) => void;
  onUpdateCollectionItemNotes: (id: string, notes: string) => void;
  wishlistItems: WishlistItem[];
  onAddWishlistItem: (item: WishlistItem) => void;
  currencySymbol?: string;
  onViewCardDetailsDirect?: (cardId: string) => void;
}

export type TrainerLabToolId = 'checklist' | 'binder' | 'grading' | 'sniper';

export interface SetProgress {
  total: number;
  owned: number;
  percent: number;
}
