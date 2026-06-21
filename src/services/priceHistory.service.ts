/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PriceSnapshot, PriceNotification } from '../types';
import { CURRENT_MARKET_PRICES, CARD_PRICE_HISTORIES } from '../data/pokemonData';
import { IPriceService } from './interfaces';

export class LocalStoragePriceService implements IPriceService {
  getMarketPrices(): Record<string, number> {
    const saved = localStorage.getItem('tcgvault_prices') || localStorage.getItem('pokevault_prices');
    if (saved) return JSON.parse(saved);
    return CURRENT_MARKET_PRICES;
  }

  saveMarketPrices(prices: Record<string, number>): void {
    localStorage.setItem('tcgvault_prices', JSON.stringify(prices));
  }

  getPriceHistories(): Record<string, PriceSnapshot[]> {
    const saved = localStorage.getItem('tcgvault_histories') || localStorage.getItem('pokevault_histories');
    if (saved) return JSON.parse(saved);
    return CARD_PRICE_HISTORIES;
  }

  savePriceHistories(histories: Record<string, PriceSnapshot[]>): void {
    localStorage.setItem('tcgvault_histories', JSON.stringify(histories));
  }

  getNotifications(): PriceNotification[] {
    const saved = localStorage.getItem('tcgvault_notifications') || localStorage.getItem('pokevault_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'init-notif-1',
        cardId: 'umb-en-evs-215',
        cardName: 'Umbreon VMAX (Alt Art)',
        language: 'EN',
        oldPrice: 890,
        newPrice: 980,
        changePercent: 10.11,
        timestamp: 'Just now',
        isRead: false
      },
      {
        id: 'init-notif-2',
        cardId: 'char-en-obf-223',
        cardName: 'Charizard ex',
        language: 'EN',
        oldPrice: 195,
        newPrice: 210,
        changePercent: 7.69,
        timestamp: '1h ago',
        isRead: true
      }
    ];
  }

  saveNotifications(notifications: PriceNotification[]): void {
    localStorage.setItem('tcgvault_notifications', JSON.stringify(notifications));
  }

  getPriceAlerts(): Record<string, { enabled: boolean; targetPrice: number }> {
    const saved = localStorage.getItem('tcgvault_price_alerts') || localStorage.getItem('pokevault_price_alerts');
    if (saved) return JSON.parse(saved);
    return {};
  }

  savePriceAlerts(alerts: Record<string, { enabled: boolean; targetPrice: number }>): void {
    localStorage.setItem('tcgvault_price_alerts', JSON.stringify(alerts));
  }
}

export const priceHistoryService = new LocalStoragePriceService();
