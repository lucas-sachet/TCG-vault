/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { WishlistItem, Card } from '../types';
import { INITIAL_WISHLIST_ITEMS } from '../data/pokemonData';
import { services } from '../services/serviceProvider';

interface UseWishlistOptions {
  cards: Card[];
  marketPrices: Record<string, number>;
  onAcquire?: (
    cardId: string, 
    purchasePrice: number, 
    purchaseDate: string, 
    gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS', 
    gradeValue: string, 
    certNumber?: string
  ) => void;
}

export function useWishlist({ cards, marketPrices, onAcquire }: UseWishlistOptions) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => services.wishlist.getWishlistItems());

  // Persistent syncing to wishlist service
  useEffect(() => {
    services.wishlist.saveWishlistItems(wishlistItems);
  }, [wishlistItems]);

  const addWishlistItem = (
    cardId: string, 
    desiredPrice: number, 
    priority: 'High' | 'Medium' | 'Low', 
    notes?: string
  ) => {
    const card = cards.find(c => c.id === cardId)!;
    const currentMarket = marketPrices[cardId] || desiredPrice;

    const newWish: WishlistItem = {
      id: `wish-${Date.now()}`,
      cardId,
      desiredPrice,
      currentMarketPrice: currentMarket,
      priority,
      notes,
      language: card.language
    };

    setWishlistItems(prev => [newWish, ...prev]);
  };

  const deleteWishlistItem = (wishId: string) => {
    setWishlistItems(prev => prev.filter(w => w.id !== wishId));
  };

  const acquireWishlistItem = (
    wishId: string, 
    purchasePrice: number, 
    purchaseDate: string, 
    gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS', 
    gradeValue: string, 
    certNumber?: string
  ) => {
    const wishItem = wishlistItems.find(w => w.id === wishId);
    if (!wishItem) return;

    if (onAcquire) {
      onAcquire(
        wishItem.cardId, 
        purchasePrice, 
        purchaseDate, 
        gradeType, 
        gradeValue, 
        certNumber
      );
    }

    setWishlistItems(prev => prev.filter(w => w.id !== wishId));
  };

  const resetWishlist = (type: 'seed' | 'empty') => {
    if (type === 'seed') {
      setWishlistItems(INITIAL_WISHLIST_ITEMS);
    } else {
      setWishlistItems([]);
    }
  };

  return {
    wishlistItems,
    setWishlistItems,
    addWishlistItem,
    deleteWishlistItem,
    acquireWishlistItem,
    resetWishlist
  };
}
