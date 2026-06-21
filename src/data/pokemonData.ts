/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CollectionItem, WishlistItem, PriceSnapshot } from '../types';

// Complying with: "Remove all mock card data"
// Resetting default cards, collections, prices and histories to empty states.
export const POKEMON_CARDS: Card[] = [];

export const INITIAL_COLLECTION_ITEMS: CollectionItem[] = [];

export const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [];

export const CURRENT_MARKET_PRICES: Record<string, number> = {};

export const CARD_PRICE_HISTORIES: Record<string, PriceSnapshot[]> = {};

export const INITIAL_BINDERS = [
  { id: 'binder-all', name: 'Main Vault', description: 'Primary master collection binder', createdAt: '2026-06-15' },
  { id: 'binder-1', name: 'Expansions', description: 'Recent set lists and art rarities', createdAt: '2026-06-15' },
  { id: 'binder-2', name: 'Investment Grade', description: 'Graded specimens and sealed-like singletons', createdAt: '2026-06-15' }
];

export const SET_METADATA: Record<string, { year: string; iconBg: string }> = {
  'Obsidian Flames': { year: '2023', iconBg: 'from-orange-600 to-red-800' },
  'Ruler of the Black Flame': { year: '2023', iconBg: 'from-red-700 to-amber-900' },
  'Obsidianas em Chamas': { year: '2023', iconBg: 'from-orange-500 to-red-700' },
  'Evolving Skies': { year: '2021', iconBg: 'from-teal-600 to-indigo-800' },
  'Eevee Heroes': { year: '2021', iconBg: 'from-pink-500 to-purple-800' },
  'Fusion Strike': { year: '2021', iconBg: 'from-pink-600 to-fuchsia-800' },
  'Paldean Fates': { year: '2024', iconBg: 'from-cyan-600 to-blue-800' },
  'Base Set': { year: '1999', iconBg: 'from-amber-600 to-yellow-800' },
  'Silver Tempest': { year: '2022', iconBg: 'from-sky-500 to-indigo-900' },
  'Crown Zenith': { year: '2023', iconBg: 'from-yellow-500 to-purple-900' },
  'Lost Origin': { year: '2022', iconBg: 'from-violet-600 to-purple-800' }
};

export const LANGUAGE_METADATA = {
  'BR': { flag: '🇧🇷', label: 'Portuguese (BR)', labelShort: 'PT-BR' },
  'EN': { flag: '🇺🇸', label: 'English (EN)', labelShort: 'EN-US' },
  'JP': { flag: '🇯🇵', label: 'Japanese (JP)', labelShort: 'JP-JA' }
};

export const QUALITY_METADATA = {
  'M': { code: 'M', label: 'Mint', labelFull: 'M - Mint' },
  'NM': { code: 'NM', label: 'Near Mint', labelFull: 'NM - Near Mint or superior' },
  'SP': { code: 'SP', label: 'Slightly Played', labelFull: 'SP - Slightly Played or superior' },
  'MP': { code: 'MP', label: 'Moderately Played', labelFull: 'MP - Moderately Played or superior' },
  'HP': { code: 'HP', label: 'Heavily Played', labelFull: 'HP - Heavily Played or superior' },
  'D': { code: 'D', label: 'Damaged', labelFull: 'D - Damaged or superior' }
};
