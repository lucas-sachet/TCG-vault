/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CardLanguage = 'BR' | 'EN' | 'JP';

export type CardQuality = 'M' | 'NM' | 'SP' | 'MP' | 'HP' | 'D';

export interface Card {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  language: CardLanguage;
  imageUrl: string;
  supertype?: string; // 'Pokémon' | 'Trainer' etc
  subtypes?: string[];
}

export interface CollectionItem {
  id: string;
  cardId: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: string; // 'USD' | 'EUR' | 'BRL' | 'JPY'
  quantity: number;
  notes?: string;
  gradeType: 'Raw' | 'PSA' | 'CGC' | 'BGS';
  gradeValue?: number | string; // e.g. 10, 9.5, 9, "Authentic"
  certNumber?: string;
  binderId?: string; // custom binder/folder ID
  quality?: CardQuality; // custom card quality condition
  frontPhotoUrl?: string; // custom personal front photograph URL or base64 data-URL
  backPhotoUrl?: string;  // custom personal back photograph URL or base64 data-URL
}

export interface PriceSnapshot {
  cardId: string;
  marketPrice: number;
  capturedAt: string; // YYYY-MM-DD
}

export interface WishlistItem {
  id: string;
  cardId: string;
  desiredPrice: number;
  currentMarketPrice: number;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  language: CardLanguage;
}

export interface Binder {
  id: string;
  name: string;
  description?: string;
  coverCardId?: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface BinderSlot {
  id: string;
  binderId: string;
  pageNumber: number;
  slotNumber: number;
  collectionItemId: string | null;
}

export interface PriceNotification {
  id: string;
  cardId: string;
  cardName: string;
  language: CardLanguage;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  timestamp: string;
  isRead: boolean;
}

export type GoalType = 'set' | 'master_set' | 'pokemon' | 'value';

export interface CollectionGoal {
  id: string;
  name: string;
  type: GoalType;
  targetValue: string; // Set name, Pokemon name, or numeric string for market value
  createdAt: string;
}

