/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CollectionItem, PriceSnapshot, PriceNotification } from '../types';
import { CURRENT_MARKET_PRICES, CARD_PRICE_HISTORIES } from '../data/pokemonData';
import { services } from '../services/serviceProvider';
import { usePersistFeedback } from './usePersistFeedback';

const MARKET_PRICES_QUERY_KEY = ['portfolio', 'marketPrices'] as const;
const PRICE_HISTORIES_QUERY_KEY = ['portfolio', 'priceHistories'] as const;
const PRICE_NOTIFICATIONS_QUERY_KEY = ['portfolio', 'notifications'] as const;
const PRICE_ALERTS_QUERY_KEY = ['portfolio', 'priceAlerts'] as const;

export function usePortfolio() {
  const queryClient = useQueryClient();
  const { notifySaveFailure } = usePersistFeedback();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { data: marketPrices = {} } = useQuery({
    queryKey: MARKET_PRICES_QUERY_KEY,
    queryFn: () => services.prices.getMarketPrices(),
    initialData: () => services.prices.getMarketPrices(),
    staleTime: Infinity,
  });

  const { data: priceHistories = {} } = useQuery({
    queryKey: PRICE_HISTORIES_QUERY_KEY,
    queryFn: () => services.prices.getPriceHistories(),
    initialData: () => services.prices.getPriceHistories(),
    staleTime: Infinity,
  });

  const { data: priceNotifications = [] } = useQuery({
    queryKey: PRICE_NOTIFICATIONS_QUERY_KEY,
    queryFn: () => services.prices.getNotifications(),
    initialData: () => services.prices.getNotifications(),
    staleTime: Infinity,
  });

  const { data: priceAlerts = {} } = useQuery({
    queryKey: PRICE_ALERTS_QUERY_KEY,
    queryFn: () => services.prices.getPriceAlerts(),
    initialData: () => services.prices.getPriceAlerts(),
    staleTime: Infinity,
  });

  const priceAlertsRef = useRef(priceAlerts);
  const marketPricesRef = useRef(marketPrices);
  priceAlertsRef.current = priceAlerts;
  marketPricesRef.current = marketPrices;

  async function persistMarketPrices(nextPrices: Record<string, number>): Promise<boolean> {
    const previousPrices =
      queryClient.getQueryData<Record<string, number>>(MARKET_PRICES_QUERY_KEY) ?? marketPrices;
    queryClient.setQueryData(MARKET_PRICES_QUERY_KEY, nextPrices);

    const saved = await services.prices.saveMarketPrices(nextPrices);
    if (!saved) {
      queryClient.setQueryData(MARKET_PRICES_QUERY_KEY, previousPrices);
      services.prices.setMarketPrices(previousPrices);
      notifySaveFailure('os preços de mercado');
      return false;
    }

    return true;
  }

  async function persistPriceHistories(
    nextHistories: Record<string, PriceSnapshot[]>,
  ): Promise<boolean> {
    const previousHistories =
      queryClient.getQueryData<Record<string, PriceSnapshot[]>>(PRICE_HISTORIES_QUERY_KEY) ??
      priceHistories;
    queryClient.setQueryData(PRICE_HISTORIES_QUERY_KEY, nextHistories);

    const saved = await services.prices.savePriceHistories(nextHistories);
    if (!saved) {
      queryClient.setQueryData(PRICE_HISTORIES_QUERY_KEY, previousHistories);
      services.prices.setPriceHistories(previousHistories);
      notifySaveFailure('o histórico de preços');
      return false;
    }

    return true;
  }

  async function persistNotifications(nextNotifications: PriceNotification[]) {
    queryClient.setQueryData(PRICE_NOTIFICATIONS_QUERY_KEY, nextNotifications);
    await services.prices.saveNotifications(nextNotifications);
  }

  async function persistPriceAlerts(
    nextAlerts: Record<string, { enabled: boolean; targetPrice: number }>,
  ) {
    queryClient.setQueryData(PRICE_ALERTS_QUERY_KEY, nextAlerts);
    await services.prices.savePriceAlerts(nextAlerts);
  }

  const addMarketPrice = (cardId: string, price: number) => {
    void persistMarketPrices({ ...marketPrices, [cardId]: price });
    void persistPriceHistories({
      ...priceHistories,
      [cardId]: [
        { cardId, marketPrice: price * 0.9, capturedAt: '2026-04-15' },
        { cardId, marketPrice: price * 0.95, capturedAt: '2026-05-15' },
        { cardId, marketPrice: price, capturedAt: '2026-06-14' },
      ],
    });
  };

  const importMarketPricesAndHistories = (importedItems: CollectionItem[]) => {
    const updatedPrices = { ...marketPrices };
    const updatedHistories = { ...priceHistories };

    importedItems.forEach((item) => {
      if (!updatedPrices[item.cardId]) {
        updatedPrices[item.cardId] = item.purchasePrice;
      }
      if (!updatedHistories[item.cardId]) {
        updatedHistories[item.cardId] = [
          {
            cardId: item.cardId,
            marketPrice: item.purchasePrice,
            capturedAt: item.purchaseDate,
          },
        ];
      }
    });

    void persistMarketPrices(updatedPrices);
    void persistPriceHistories(updatedHistories);
  };

  const updatePriceAlert = (cardId: string, enabled: boolean, targetPrice: number) => {
    void persistPriceAlerts({
      ...priceAlerts,
      [cardId]: { enabled, targetPrice },
    });
  };

  const markNotificationRead = (notificationId: string) => {
    void persistNotifications(
      priceNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const syncMarketPrices = async (
    cards: Card[],
    collectionItems: CollectionItem[],
    currencySymbol: string,
  ) => {
    if (cards.length === 0) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const cardIds = cards.map((card) => card.id);
      const response = await fetch('/api/prices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      });

      if (!response.ok) {
        throw new Error(`Price sync failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { prices: Record<string, number> };
      const fetchedPrices = payload.prices;
      const updatedPrices = { ...marketPricesRef.current, ...fetchedPrices };
      await persistMarketPrices(updatedPrices);

      const updatedHistories = { ...priceHistories };
      const capturedAt = new Date().toISOString().split('T')[0];

      cards.forEach((card) => {
        const newPrice = fetchedPrices[card.id];
        if (!newPrice) {
          return;
        }

        const previousSnapshots = updatedHistories[card.id] || [];
        const nextSnapshots = [...previousSnapshots];
        if (nextSnapshots.length >= 6) {
          nextSnapshots.shift();
        }
        nextSnapshots.push({ cardId: card.id, marketPrice: newPrice, capturedAt });
        updatedHistories[card.id] = nextSnapshots;
      });
      await persistPriceHistories(updatedHistories);

      const generatedNotifications: PriceNotification[] = [];
      cards.forEach((card) => {
        const newPrice = fetchedPrices[card.id];
        if (!newPrice) {
          return;
        }

        const oldPrice = marketPricesRef.current[card.id] || newPrice;
        const changePercent =
          oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0;
        const isOwned = collectionItems.some((item) => item.cardId === card.id);

        if (isOwned && Math.abs(changePercent) > 5) {
          generatedNotifications.unshift({
            id: `notif-${Date.now()}-${card.id}`,
            cardId: card.id,
            cardName: card.name,
            language: card.language,
            oldPrice,
            newPrice,
            changePercent,
            timestamp: 'Just now',
            isRead: false,
          });
        }

        const alert = priceAlertsRef.current[card.id];
        if (alert?.enabled) {
          const crossedUp =
            oldPrice < alert.targetPrice && newPrice >= alert.targetPrice;
          const crossedDown =
            oldPrice > alert.targetPrice && newPrice <= alert.targetPrice;
          const matchesExactly = newPrice === alert.targetPrice;

          if (crossedUp || crossedDown || matchesExactly) {
            const direction = crossedUp
              ? '📈 UPWARDS'
              : crossedDown
                ? '📉 DOWNWARDS'
                : '🎯 HIT';
            generatedNotifications.unshift({
              id: `alert-trigger-${Date.now()}-${card.id}`,
              cardId: card.id,
              cardName: `🔔 [ALERT] ${card.name} (${card.language})`,
              language: card.language,
              oldPrice,
              newPrice,
              changePercent,
              timestamp: `${direction} crossed target of ${currencySymbol}${alert.targetPrice}`,
              isRead: false,
            });
          }
        }
      });

      if (generatedNotifications.length > 0) {
        await persistNotifications(
          [...generatedNotifications, ...priceNotifications].slice(0, 20),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to sync market prices';
      setSyncError(message);
      console.error('Market price sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetPortfolio = (type: 'seed') => {
    if (type === 'seed') {
      void persistMarketPrices(CURRENT_MARKET_PRICES);
      void persistPriceHistories(CARD_PRICE_HISTORIES);
    }
  };

  const setMarketPrices = (
    updater:
      | Record<string, number>
      | ((previousPrices: Record<string, number>) => Record<string, number>),
  ) => {
    const nextPrices =
      typeof updater === 'function' ? updater(marketPrices) : updater;
    void persistMarketPrices(nextPrices);
  };

  const setPriceHistories = (
    updater:
      | Record<string, PriceSnapshot[]>
      | ((previousHistories: Record<string, PriceSnapshot[]>) => Record<string, PriceSnapshot[]>),
  ) => {
    const nextHistories =
      typeof updater === 'function' ? updater(priceHistories) : updater;
    void persistPriceHistories(nextHistories);
  };

  const setPriceNotifications = (
    updater:
      | PriceNotification[]
      | ((previousNotifications: PriceNotification[]) => PriceNotification[]),
  ) => {
    const nextNotifications =
      typeof updater === 'function' ? updater(priceNotifications) : updater;
    void persistNotifications(nextNotifications);
  };

  const setPriceAlerts = (
    updater:
      | Record<string, { enabled: boolean; targetPrice: number }>
      | ((
          previousAlerts: Record<string, { enabled: boolean; targetPrice: number }>,
        ) => Record<string, { enabled: boolean; targetPrice: number }>),
  ) => {
    const nextAlerts = typeof updater === 'function' ? updater(priceAlerts) : updater;
    void persistPriceAlerts(nextAlerts);
  };

  const activeUnreadNotifsCount = priceNotifications.filter(
    (notification) => !notification.isRead,
  ).length;

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
    syncError,
    addMarketPrice,
    importMarketPricesAndHistories,
    updatePriceAlert,
    markNotificationRead,
    syncMarketPrices,
    resetPortfolio,
    activeUnreadNotifsCount,
  };
}
