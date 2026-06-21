/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CollectionItem, WishlistItem, PriceSnapshot, Binder, PriceNotification, CollectionGoal } from '../types';

export interface ICardService {
  getCards(): Card[];
  saveCards(cards: Card[]): void;
}

export interface IHoldingService {
  getHoldings(): CollectionItem[];
  saveHoldings(holdings: CollectionItem[]): void;
}

export interface IWishlistService {
  getWishlistItems(): WishlistItem[];
  saveWishlistItems(items: WishlistItem[]): void;
}

export interface IBinderService {
  getBinders(): Binder[];
  saveBinders(binders: Binder[]): void;
}

export interface IPriceService {
  getMarketPrices(): Record<string, number>;
  saveMarketPrices(prices: Record<string, number>): void;

  getPriceHistories(): Record<string, PriceSnapshot[]>;
  savePriceHistories(histories: Record<string, PriceSnapshot[]>): void;

  getNotifications(): PriceNotification[];
  saveNotifications(notifications: PriceNotification[]): void;

  getPriceAlerts(): Record<string, { enabled: boolean; targetPrice: number }>;
  savePriceAlerts(alerts: Record<string, { enabled: boolean; targetPrice: number }>): void;
}

export interface IGoalService {
  getGoals(): CollectionGoal[];
  saveGoals(goals: CollectionGoal[]): void;
}

export interface ISettingsService {
  getPreferSpecimenPhoto(): boolean;
  setPreferSpecimenPhoto(value: boolean): void;
}
