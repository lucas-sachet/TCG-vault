/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card } from '../types';
import { POKEMON_CARDS } from '../data/pokemonData';
import { ICardService } from './interfaces';

export class LocalStorageCardService implements ICardService {
  getCards(): Card[] {
    const saved = localStorage.getItem('tcgvault_cards') || localStorage.getItem('pokevault_cards');
    if (saved) return JSON.parse(saved);
    return POKEMON_CARDS;
  }

  saveCards(cards: Card[]): void {
    localStorage.setItem('tcgvault_cards', JSON.stringify(cards));
  }
}

export const cardsService = new LocalStorageCardService();
