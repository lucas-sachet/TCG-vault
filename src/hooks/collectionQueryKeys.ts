/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLLECTION_QUERY_KEYS = {
  cards: ['collection', 'cards'] as const,
  holdings: ['collection', 'holdings'] as const,
  binders: ['collection', 'binders'] as const,
  binderSlots: ['collection', 'binderSlots'] as const,
};

export const PORTFOLIO_QUERY_KEYS = {
  marketPrices: ['portfolio', 'marketPrices'] as const,
  priceHistories: ['portfolio', 'priceHistories'] as const,
  notifications: ['portfolio', 'notifications'] as const,
  priceAlerts: ['portfolio', 'priceAlerts'] as const,
};

export const WISHLIST_QUERY_KEY = ['wishlist', 'items'] as const;
export const GOALS_QUERY_KEY = ['analytics', 'goals'] as const;
