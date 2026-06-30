import { useMemo } from 'react';
import type { Card, CollectionItem, WishlistItem, PriceSnapshot } from '../../types';
import type { JourneyTimelineEvent } from './cardDetailsTypes';

interface UseCardJourneyTimelineParams {
  card: Card | undefined;
  cardHoldings: CollectionItem[];
  isOwned: boolean;
  isWishlist: boolean;
  wishlistItem: WishlistItem | undefined;
  historySeries: PriceSnapshot[];
  averageCostBasis: number;
  totalValue: number;
  totalHoldingsQty: number;
  currencySymbol: string;
}

export function useCardJourneyTimeline({
  card,
  cardHoldings,
  isOwned,
  isWishlist,
  wishlistItem,
  historySeries,
  averageCostBasis,
  totalValue,
  totalHoldingsQty,
  currencySymbol
}: UseCardJourneyTimelineParams): JourneyTimelineEvent[] {
  return useMemo(() => {
    if (!card) return [];
    const list: JourneyTimelineEvent[] = [];

    if (isWishlist && wishlistItem) {
      list.push({
        type: 'purchased',
        date: new Date().toISOString().split('T')[0],
        title: '🔒 Wishlist Target Set',
        description: `Marked as wishlist item, seeking acquisition under target price of ${currencySymbol}${wishlistItem.desiredPrice}.`,
        badge: 'WISHLIST SEEKING',
        badgeType: 'warning'
      });
    }

    if (!isOwned) {
      return list;
    }

    const sortedHoldings = [...cardHoldings].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

    sortedHoldings.forEach((holding, idx) => {
      const isInitial = idx === 0;
      const displayDate = holding.purchaseDate;
      const qtyText = holding.quantity > 1 ? ` (${holding.quantity}x copies)` : '';

      list.push({
        type: isInitial ? 'purchased' : 'additional_copy',
        date: displayDate,
        title: isInitial ? '✨ First Copy Sourced' : '📦 Additional Copy Acquired',
        description: isInitial
          ? `Officially added to your collection! Sourced first copy of ${card.name} for ${currencySymbol}${holding.purchasePrice.toLocaleString()}${qtyText} in condition ${holding.quality || 'NM'}.`
          : `Grew your collection! Sourced another copy on ${displayDate} for ${currencySymbol}${holding.purchasePrice.toLocaleString()}${qtyText}.`,
        badge: isInitial ? 'FIRST OWNED' : 'COLLECTION GROWTH',
        badgeType: isInitial ? 'primary' : 'success'
      });

      if (holding.gradeType && holding.gradeType !== 'Raw') {
        const buyDateObj = new Date(holding.purchaseDate);
        const sentDateObj = new Date(buyDateObj.getTime() + 12 * 24 * 60 * 60 * 1000);
        const sentDateStr = sentDateObj.toISOString().split('T')[0];
        const certDateObj = new Date(buyDateObj.getTime() + 35 * 24 * 60 * 60 * 1000);
        const certDateStr = certDateObj.toISOString().split('T')[0];
        const todayStr = '2026-06-15';

        if (sentDateStr <= todayStr) {
          list.push({
            type: 'sent_grading',
            date: sentDateStr,
            title: `🛡️ Sent to ${holding.gradeType} Core Labs`,
            description: 'Prepared, packaged, and dispatched copy securely for official grading credentials.',
            badge: 'GRADING IN PROGRESS',
            badgeType: 'info'
          });
        }

        if (certDateStr <= todayStr) {
          list.push({
            type: 'grade_received',
            date: certDateStr,
            title: `🏆 Certified Grade: ${holding.gradeType} ${holding.gradeValue}`,
            description: `Certification complete! Returned with authenticated mint slab grade of ${holding.gradeValue} under active collection tracking.`,
            badge: 'SLAB ACTIVATED',
            badgeType: 'primary'
          });
        }
      }

      if (holding.notes && holding.notes.trim()) {
        list.push({
          type: 'notes',
          date: displayDate,
          title: '📝 Collector Journal Insight Added',
          description: `"${holding.notes}"`,
          badge: 'MEMORABILIA RECORD',
          badgeType: 'info'
        });
      }
    });

    const sortedHistory = [...historySeries].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    if (sortedHistory.length > 0) {
      let lastPrice = sortedHistory[0].marketPrice;

      sortedHistory.forEach((snap, snapIdx) => {
        const percentageDiff = lastPrice > 0 ? ((snap.marketPrice - lastPrice) / lastPrice) * 100 : 0;

        if (Math.abs(percentageDiff) >= 10 && snapIdx > 0) {
          const isUp = percentageDiff > 0;
          list.push({
            type: 'price_milestone',
            date: snap.capturedAt,
            title: isUp ? '📈 Price Apex Achievement' : '📉 Price Readjustment',
            description: `Standard market quote changed ${isUp ? '+' : ''}${percentageDiff.toFixed(0)}%, registering at ${currencySymbol}${snap.marketPrice} on historical pricing catalogs.`,
            badge: isUp ? 'MARKET APPRECIATION' : 'PRICE CORRECTION',
            badgeType: isUp ? 'success' : 'warning'
          });
        }
        lastPrice = snap.marketPrice;
      });

      const highestPriceObj = sortedHistory.reduce(
        (max, obj) => (obj.marketPrice > max.marketPrice ? obj : max),
        sortedHistory[0]
      );
      if (highestPriceObj.marketPrice > averageCostBasis && sortedHistory.length > 1) {
        list.push({
          type: 'price_milestone',
          date: highestPriceObj.capturedAt,
          title: '🎯 Record Valuation Summit',
          description: `Market quote spiked to a historical peak of ${currencySymbol}${highestPriceObj.marketPrice}, marking a milestone high in appreciation.`,
          badge: 'ALL-TIME HIGH RECORD',
          badgeType: 'success'
        });
      }
    }

    if (totalHoldingsQty > 0 && totalValue >= 500) {
      list.push({
        type: 'portfolio_milestone',
        date: new Date().toISOString().split('T')[0],
        title: '💎 Premium Card Milestone',
        description: `This card's combined collection value crossed the half-grand benchmark, reaching ${currencySymbol}${Math.round(totalValue).toLocaleString()}!`,
        badge: 'PREMIUM TIER CARD',
        badgeType: 'primary'
      });
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [card, cardHoldings, isWishlist, wishlistItem, historySeries, averageCostBasis, totalValue, totalHoldingsQty, currencySymbol, isOwned]);
}
