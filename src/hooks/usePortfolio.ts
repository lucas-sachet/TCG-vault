/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Card, CollectionItem, PriceSnapshot, PriceNotification } from '../types';
import { CURRENT_MARKET_PRICES, CARD_PRICE_HISTORIES } from '../data/pokemonData';
import { services } from '../services/serviceProvider';

export function usePortfolio() {
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>(() => services.prices.getMarketPrices());
  const [priceHistories, setPriceHistories] = useState<Record<string, PriceSnapshot[]>>(() => services.prices.getPriceHistories());
  const [priceNotifications, setPriceNotifications] = useState<PriceNotification[]>(() => services.prices.getNotifications());
  const [priceAlerts, setPriceAlerts] = useState<Record<string, { enabled: boolean; targetPrice: number }>>(() => services.prices.getPriceAlerts());
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state changes to backend/local storage services
  useEffect(() => {
    services.prices.saveMarketPrices(marketPrices);
  }, [marketPrices]);

  useEffect(() => {
    services.prices.savePriceHistories(priceHistories);
  }, [priceHistories]);

  useEffect(() => {
    services.prices.saveNotifications(priceNotifications);
  }, [priceNotifications]);

  useEffect(() => {
    services.prices.savePriceAlerts(priceAlerts);
  }, [priceAlerts]);

  const addMarketPrice = (cardId: string, price: number) => {
    setMarketPrices(prev => ({ ...prev, [cardId]: price }));
    setPriceHistories(prev => ({
      ...prev,
      [cardId]: [
        { cardId: cardId, marketPrice: price * 0.9, capturedAt: '2026-04-15' },
        { cardId: cardId, marketPrice: price * 0.95, capturedAt: '2026-05-15' },
        { cardId: cardId, marketPrice: price, capturedAt: '2026-06-14' }
      ]
    }));
  };

  const importMarketPricesAndHistories = (importedItems: CollectionItem[]) => {
    setMarketPrices(prev => {
      const updated = { ...prev };
      importedItems.forEach(item => {
        if (!updated[item.cardId]) {
          updated[item.cardId] = item.purchasePrice;
        }
      });
      return updated;
    });

    setPriceHistories(prev => {
      const updated = { ...prev };
      importedItems.forEach(item => {
        if (!updated[item.cardId]) {
          updated[item.cardId] = [
            { cardId: item.cardId, marketPrice: item.purchasePrice, capturedAt: item.purchaseDate }
          ];
        }
      });
      return updated;
    });
  };

  const updatePriceAlert = (cardId: string, enabled: boolean, targetPrice: number) => {
    setPriceAlerts(prev => ({
      ...prev,
      [cardId]: { enabled, targetPrice }
    }));
  };

  const markNotificationRead = (notifId: string) => {
    setPriceNotifications(prev => prev.map(n => {
      if (n.id === notifId) return { ...n, isRead: true };
      return n;
    }));
  };

  const syncMarketPrices = (
    cards: Card[], 
    collectionItems: CollectionItem[], 
    currencySymbol: string
  ) => {
    setIsSyncing(true);

    setTimeout(() => {
      const updatedPrices = { ...marketPrices };
      const updatedHistories = { ...priceHistories };
      const generatedNotifs: PriceNotification[] = [];
      const processedCardIds = new Set<string>();

      cards.forEach((card) => {
        if (processedCardIds.has(card.id)) return;
        processedCardIds.add(card.id);

        const oldPrice = updatedPrices[card.id] || 100;
        const changePercent = (Math.random() * 22) - 8; // -8% to +14%
        const multiplier = 1 + (changePercent / 100);
        const newPrice = Math.max(1, Math.round(oldPrice * multiplier));

        updatedPrices[card.id] = newPrice;

        const prevSnapshots = updatedHistories[card.id] || [];
        const nextSnapshots = [...prevSnapshots];
        if (nextSnapshots.length >= 6) {
          nextSnapshots.shift();
        }
        nextSnapshots.push({
          cardId: card.id,
          marketPrice: newPrice,
          capturedAt: new Date().toISOString().split('T')[0]
        });
        updatedHistories[card.id] = nextSnapshots;

        const isOwned = collectionItems.some(item => item.cardId === card.id);

        if (isOwned && Math.abs(changePercent) > 5) {
          generatedNotifs.unshift({
            id: `notif-${Date.now()}-${card.id}`,
            cardId: card.id,
            cardName: card.name,
            language: card.language,
            oldPrice: oldPrice,
            newPrice: newPrice,
            changePercent: changePercent,
            timestamp: 'Just now',
            isRead: false
          });
        }

        const alert = priceAlerts[card.id];
        if (alert && alert.enabled) {
          const crossedUp = oldPrice < alert.targetPrice && newPrice >= alert.targetPrice;
          const crossedDown = oldPrice > alert.targetPrice && newPrice <= alert.targetPrice;
          const matchesExactly = newPrice === alert.targetPrice;

          if (crossedUp || crossedDown || matchesExactly) {
            const direction = crossedUp ? '📈 UPWARDS' : crossedDown ? '📉 DOWNWARDS' : '🎯 HIT';
            generatedNotifs.unshift({
              id: `alert-trigger-${Date.now()}-${card.id}`,
              cardId: card.id,
              cardName: `🔔 [ALERT] ${card.name} (${card.language})`,
              language: card.language,
              oldPrice: oldPrice,
              newPrice: newPrice,
              changePercent: changePercent,
              timestamp: `${direction} crossed target of ${currencySymbol}${alert.targetPrice}`,
              isRead: false
            });
          }
        }
      });

      setMarketPrices(updatedPrices);
      setPriceHistories(updatedHistories);
      if (generatedNotifs.length > 0) {
        setPriceNotifications(curr => [...generatedNotifs, ...curr].slice(0, 20));
      }
      setIsSyncing(false);
    }, 1500);
  };

  const resetPortfolio = (type: 'seed') => {
    if (type === 'seed') {
      setMarketPrices(CURRENT_MARKET_PRICES);
      setPriceHistories(CARD_PRICE_HISTORIES);
    }
    // Notifications and Alerts persist as loaded (or do not need resetting)
  };

  const activeUnreadNotifsCount = priceNotifications.filter(n => !n.isRead).length;

  return {
    marketPrices,
    setMarketPrices,
    priceHistories,
    setPriceHistories,
    priceNotifications,
    setPriceNotifications,
    priceAlerts,
    setPriceAlerts,
    isSyncing,
    addMarketPrice,
    importMarketPricesAndHistories,
    updatePriceAlert,
    markNotificationRead,
    syncMarketPrices,
    resetPortfolio,
    activeUnreadNotifsCount
  };
}
