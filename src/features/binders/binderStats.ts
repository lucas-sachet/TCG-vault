/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BinderSlot, Card, CollectionItem } from '../../types';

export interface PageFillStats {
  filledCount: number;
  totalCount: number;
  fillPercentage: number;
}

export function getBinderSlottedCount(binderId: string, binderSlots: BinderSlot[]): number {
  return binderSlots.filter(
    (slot) => slot.binderId === binderId && slot.collectionItemId !== null,
  ).length;
}

export function getPageFillStats(
  binderId: string,
  pageNumber: number,
  binderSlots: BinderSlot[],
  totalPockets = 9,
): PageFillStats {
  const filledCount = binderSlots.filter(
    (slot) =>
      slot.binderId === binderId
      && slot.pageNumber === pageNumber
      && slot.collectionItemId !== null,
  ).length;

  const fillPercentage = totalPockets > 0 ? (filledCount / totalPockets) * 100 : 0;

  return {
    filledCount,
    totalCount: totalPockets,
    fillPercentage,
  };
}

export function getBinderTotalValue(
  binderId: string,
  binderSlots: BinderSlot[],
  collectionItems: CollectionItem[],
  cards: Card[],
  marketPrices: Record<string, number>,
): number {
  const slottedHoldingIds = binderSlots
    .filter((slot) => slot.binderId === binderId && slot.collectionItemId !== null)
    .map((slot) => slot.collectionItemId as string);

  const holdingById = new Map(collectionItems.map((item) => [item.id, item]));
  const cardById = new Map(cards.map((card) => [card.id, card]));

  let totalValue = 0;

  for (const holdingId of slottedHoldingIds) {
    const holding = holdingById.get(holdingId);
    if (!holding) {
      continue;
    }
    const card = cardById.get(holding.cardId);
    if (!card) {
      continue;
    }
    totalValue += marketPrices[card.id] ?? 0;
  }

  return totalValue;
}

export function filterUnslottedHoldings(
  collectionItems: CollectionItem[],
  slottedIds: Set<string>,
  selectedBinderId: string,
  showAllUnslotted: boolean,
): CollectionItem[] {
  return collectionItems.filter((item) => {
    if (slottedIds.has(item.id)) {
      return false;
    }
    if (showAllUnslotted) {
      return true;
    }
    return !item.binderId || item.binderId === selectedBinderId;
  });
}
