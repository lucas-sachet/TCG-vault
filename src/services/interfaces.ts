/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CollectionItem, WishlistItem, PriceSnapshot, Binder, BinderSlot, PriceNotification, CollectionGoal } from '../types';

export interface ICardService {
  getCards(): Card[];
  setCards(cards: Card[]): void;
  saveCards(cards: Card[]): Promise<boolean>;
}

export interface IHoldingService {
  getHoldings(): CollectionItem[];
  setHoldings(holdings: CollectionItem[]): void;
  saveHoldings(holdings: CollectionItem[]): Promise<boolean>;
}

export interface IWishlistService {
  getWishlistItems(): WishlistItem[];
  saveWishlistItems(items: WishlistItem[]): void;
}

export interface IBinderService {
  getBinders(): Binder[];
  setBinders(binders: Binder[]): void;
  saveBinders(binders: Binder[]): Promise<boolean>;
}

export interface IBinderSlotService {
  getBinderSlots(): BinderSlot[];
  setBinderSlots(slots: BinderSlot[]): void;
  saveBinderSlots(slots: BinderSlot[]): Promise<boolean>;
  createSlotRecord(
    binderId: string,
    pageNumber: number,
    slotNumber: number,
    collectionItemId: string | null,
  ): BinderSlot;
}

export interface IPriceService {
  getMarketPrices(): Record<string, number>;
  setMarketPrices(prices: Record<string, number>): void;
  saveMarketPrices(prices: Record<string, number>): Promise<boolean>;
  syncMarketPricesForCardIds(cardIds: string[]): Promise<boolean>;

  getPriceHistories(): Record<string, PriceSnapshot[]>;
  setPriceHistories(histories: Record<string, PriceSnapshot[]>): void;
  savePriceHistories(histories: Record<string, PriceSnapshot[]>): Promise<boolean>;

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
  getOnboarded(): boolean;
  setOnboarded(value: boolean): void;
  getLanguages(): string[];
  setLanguages(value: string[]): void;
}
