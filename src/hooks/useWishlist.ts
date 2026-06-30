/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WishlistItem, Card } from '../types';
import { INITIAL_WISHLIST_ITEMS } from '../data/pokemonData';
import { services } from '../services/serviceProvider';

const WISHLIST_QUERY_KEY = ['collection', 'wishlist'] as const;

interface UseWishlistOptions {
  cards: Card[];
  marketPrices: Record<string, number>;
  onAcquire?: (
    cardId: string,
    purchasePrice: number,
    purchaseDate: string,
    gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS',
    gradeValue: string,
    certNumber?: string,
  ) => void;
}

export function useWishlist({ cards, marketPrices, onAcquire }: UseWishlistOptions) {
  const queryClient = useQueryClient();

  const { data: wishlistItems = [] } = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => services.wishlist.getWishlistItems(),
    initialData: () => services.wishlist.getWishlistItems(),
    staleTime: Infinity,
  });

  async function persistWishlist(nextWishlistItems: WishlistItem[]) {
    queryClient.setQueryData(WISHLIST_QUERY_KEY, nextWishlistItems);
    await services.wishlist.saveWishlistItems(nextWishlistItems);
  }

  const addWishlistItem = (
    cardId: string,
    desiredPrice: number,
    priority: 'High' | 'Medium' | 'Low',
    notes?: string,
  ) => {
    const card = cards.find((catalogCard) => catalogCard.id === cardId);
    if (!card) {
      return;
    }

    const currentMarketPrice = marketPrices[cardId] || desiredPrice;
    const newWishlistItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      cardId,
      desiredPrice,
      currentMarketPrice,
      priority,
      notes,
      language: card.language,
    };

    void persistWishlist([newWishlistItem, ...wishlistItems]);
  };

  const deleteWishlistItem = (wishId: string) => {
    void persistWishlist(wishlistItems.filter((item) => item.id !== wishId));
  };

  const acquireWishlistItem = (
    wishId: string,
    purchasePrice: number,
    purchaseDate: string,
    gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS',
    gradeValue: string,
    certNumber?: string,
  ) => {
    const wishItem = wishlistItems.find((item) => item.id === wishId);
    if (!wishItem) {
      return;
    }

    onAcquire?.(
      wishItem.cardId,
      purchasePrice,
      purchaseDate,
      gradeType,
      gradeValue,
      certNumber,
    );

    void persistWishlist(wishlistItems.filter((item) => item.id !== wishId));
  };

  const resetWishlist = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      void persistWishlist(INITIAL_WISHLIST_ITEMS);
      return;
    }

    void persistWishlist([]);
  };

  const setWishlistItems = (
    updater: WishlistItem[] | ((previousItems: WishlistItem[]) => WishlistItem[]),
  ) => {
    const nextItems =
      typeof updater === 'function' ? updater(wishlistItems) : updater;
    void persistWishlist(nextItems);
  };

  return {
    wishlistItems,
    setWishlistItems,
    addWishlistItem,
    deleteWishlistItem,
    acquireWishlistItem,
    resetWishlist,
  };
}
