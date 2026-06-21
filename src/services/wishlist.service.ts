/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WishlistItem } from '../types';
import { INITIAL_WISHLIST_ITEMS } from '../data/pokemonData';
import { IWishlistService } from './interfaces';

export class LocalStorageWishlistService implements IWishlistService {
  getWishlistItems(): WishlistItem[] {
    const saved = localStorage.getItem('tcgvault_wishlist') || localStorage.getItem('pokevault_wishlist');
    if (saved) return JSON.parse(saved);
    return INITIAL_WISHLIST_ITEMS;
  }

  saveWishlistItems(items: WishlistItem[]): void {
    localStorage.setItem('tcgvault_wishlist', JSON.stringify(items));
  }
}

export const wishlistService = new LocalStorageWishlistService();
