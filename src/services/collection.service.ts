/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionItem } from '../types';
import { INITIAL_COLLECTION_ITEMS } from '../data/pokemonData';
import { IHoldingService } from './interfaces';

export class LocalStorageHoldingService implements IHoldingService {
  getHoldings(): CollectionItem[] {
    const saved = localStorage.getItem('tcgvault_collection') || localStorage.getItem('pokevault_collection');
    if (saved) return JSON.parse(saved);
    return INITIAL_COLLECTION_ITEMS;
  }

  saveHoldings(holdings: CollectionItem[]): void {
    localStorage.setItem('tcgvault_collection', JSON.stringify(holdings));
  }
}

export const collectionService = new LocalStorageHoldingService();
