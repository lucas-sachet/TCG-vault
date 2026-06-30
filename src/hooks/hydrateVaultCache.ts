/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient } from '@tanstack/react-query';
import { services } from '@/src/services/serviceProvider';
import {
  COLLECTION_QUERY_KEYS,
  GOALS_QUERY_KEY,
  PORTFOLIO_QUERY_KEYS,
  WISHLIST_QUERY_KEY,
} from './collectionQueryKeys';

export function hydrateVaultCache(queryClient: QueryClient): void {
  queryClient.setQueryData(COLLECTION_QUERY_KEYS.cards, services.cards.getCards());
  queryClient.setQueryData(COLLECTION_QUERY_KEYS.holdings, services.holdings.getHoldings());
  queryClient.setQueryData(COLLECTION_QUERY_KEYS.binders, services.binders.getBinders());
  queryClient.setQueryData(COLLECTION_QUERY_KEYS.binderSlots, services.binderSlots.getBinderSlots());
  queryClient.setQueryData(PORTFOLIO_QUERY_KEYS.marketPrices, services.prices.getMarketPrices());
  queryClient.setQueryData(PORTFOLIO_QUERY_KEYS.priceHistories, services.prices.getPriceHistories());
  queryClient.setQueryData(PORTFOLIO_QUERY_KEYS.notifications, services.prices.getNotifications());
  queryClient.setQueryData(PORTFOLIO_QUERY_KEYS.priceAlerts, services.prices.getPriceAlerts());
  queryClient.setQueryData(WISHLIST_QUERY_KEY, services.wishlist.getWishlistItems());
  queryClient.setQueryData(GOALS_QUERY_KEY, services.goals.getGoals());
}
