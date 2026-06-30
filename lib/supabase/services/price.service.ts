import { PriceNotification, PriceSnapshot } from '@/src/types';
import { IPriceService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';

export class SupabasePriceService implements IPriceService {
  private marketPrices: Record<string, number> = {};
  private priceHistories: Record<string, PriceSnapshot[]> = {};
  private notifications: PriceNotification[] = [];
  private priceAlerts: Record<string, { enabled: boolean; targetPrice: number }> = {};

  getMarketPrices(): Record<string, number> {
    return this.marketPrices;
  }

  setMarketPrices(prices: Record<string, number>): void {
    this.marketPrices = prices;
    localStorage.setItem('tcgvault_prices', JSON.stringify(prices));
  }

  async saveMarketPrices(prices: Record<string, number>): Promise<boolean> {
    this.marketPrices = prices;
    localStorage.setItem('tcgvault_prices', JSON.stringify(prices));

    const cardIds = Object.keys(prices);
    if (cardIds.length === 0) {
      return true;
    }

    return this.syncMarketPricesForCardIds(cardIds);
  }

  async syncMarketPricesForCardIds(cardIds: string[]): Promise<boolean> {
    const uniqueCardIds = [...new Set(cardIds.filter(Boolean))];
    if (uniqueCardIds.length === 0) {
      return true;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return true;
    }

    const { data: existingCards, error: cardsLookupError } = await supabase
      .from('cards')
      .select('id')
      .in('id', uniqueCardIds);

    if (cardsLookupError) {
      console.error('Error looking up cards before saving market prices:', cardsLookupError);
      return false;
    }

    const existingCardIds = new Set((existingCards ?? []).map((card) => card.id));
    const databasePrices = uniqueCardIds
      .filter((cardId) => existingCardIds.has(cardId) && this.marketPrices[cardId] !== undefined)
      .map((cardId) => ({
        card_id: cardId,
        price: this.marketPrices[cardId],
      }));

    if (databasePrices.length === 0) {
      return true;
    }

    const { error } = await supabase.from('market_prices').upsert(databasePrices);
    if (error) {
      console.error('Error saving market prices to Supabase:', error);
      return false;
    }

    return true;
  }

  getPriceHistories(): Record<string, PriceSnapshot[]> {
    return this.priceHistories;
  }

  setPriceHistories(histories: Record<string, PriceSnapshot[]>): void {
    this.priceHistories = histories;
    localStorage.setItem('tcgvault_histories', JSON.stringify(histories));
  }

  async savePriceHistories(histories: Record<string, PriceSnapshot[]>): Promise<boolean> {
    this.priceHistories = histories;
    localStorage.setItem('tcgvault_histories', JSON.stringify(histories));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return true;
    }

    const userId = session.user.id;

    const databaseHistories: Array<{
      card_id: string;
      market_price: number;
      captured_at: string;
      user_id: string;
    }> = [];

    Object.values(histories).forEach((snapshots) => {
      snapshots.forEach((snapshot) => {
        databaseHistories.push({
          card_id: snapshot.cardId,
          market_price: snapshot.marketPrice,
          captured_at: snapshot.capturedAt,
          user_id: userId,
        });
      });
    });

    if (databaseHistories.length === 0) {
      return true;
    }

    const uniqueCardIds = [...new Set(databaseHistories.map((history) => history.card_id))];
    const { data: existingCards, error: cardsLookupError } = await supabase
      .from('cards')
      .select('id')
      .in('id', uniqueCardIds);

    if (cardsLookupError) {
      console.error('Error looking up cards before saving price history:', cardsLookupError);
      return false;
    }

    const existingCardIds = new Set((existingCards ?? []).map((card) => card.id));
    const historiesForExistingCards = databaseHistories.filter((history) =>
      existingCardIds.has(history.card_id),
    );

    if (historiesForExistingCards.length === 0) {
      return true;
    }

    const { error } = await supabase
      .from('price_history')
      .upsert(historiesForExistingCards, { onConflict: 'user_id,card_id,captured_at' });
    if (error) {
      console.error('Error saving price history to Supabase:', error);
      return false;
    }

    return true;
  }

  getNotifications(): PriceNotification[] {
    return this.notifications;
  }

  setNotifications(notifications: PriceNotification[]): void {
    this.notifications = notifications;
    localStorage.setItem('tcgvault_notifications', JSON.stringify(notifications));
  }

  async saveNotifications(notifications: PriceNotification[]): Promise<void> {
    this.notifications = notifications;
    localStorage.setItem('tcgvault_notifications', JSON.stringify(notifications));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return;
    }

    const userId = session.user.id;

    try {
      const localIds = notifications.map((notification) => notification.id);
      if (localIds.length > 0) {
        await supabase
          .from('price_notifications')
          .delete()
          .eq('user_id', userId)
          .not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await supabase
          .from('price_notifications')
          .delete()
          .eq('user_id', userId);
      }

      if (notifications.length === 0) {
        return;
      }

      const databaseNotifications = notifications.map((notification) => ({
        id: notification.id,
        card_id: notification.cardId,
        card_name: notification.cardName,
        language: notification.language,
        old_price: notification.oldPrice,
        new_price: notification.newPrice,
        change_percent: notification.changePercent,
        timestamp: notification.timestamp,
        is_read: notification.isRead,
        user_id: userId,
      }));

      await supabase.from('price_notifications').upsert(databaseNotifications);
    } catch (error) {
      console.error('Error saving price notifications to Supabase:', error);
    }
  }

  getPriceAlerts(): Record<string, { enabled: boolean; targetPrice: number }> {
    return this.priceAlerts;
  }

  setPriceAlerts(alerts: Record<string, { enabled: boolean; targetPrice: number }>): void {
    this.priceAlerts = alerts;
    localStorage.setItem('tcgvault_price_alerts', JSON.stringify(alerts));
  }

  async savePriceAlerts(alerts: Record<string, { enabled: boolean; targetPrice: number }>): Promise<void> {
    this.priceAlerts = alerts;
    localStorage.setItem('tcgvault_price_alerts', JSON.stringify(alerts));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return;
    }

    const userId = session.user.id;

    try {
      await supabase.from('price_alerts').delete().eq('user_id', userId);

      const databaseAlerts = Object.entries(alerts).map(([cardId, alertValue]) => ({
        card_id: cardId,
        user_id: userId,
        target_price: alertValue.targetPrice,
        enabled: alertValue.enabled,
      }));

      if (databaseAlerts.length === 0) {
        return;
      }

      await supabase.from('price_alerts').insert(databaseAlerts);
    } catch (error) {
      console.error('Error saving price alerts to Supabase:', error);
    }
  }

  clearPrices(): void {
    this.marketPrices = {};
    this.priceHistories = {};
    this.notifications = [];
    this.priceAlerts = {};
    localStorage.removeItem('tcgvault_prices');
    localStorage.removeItem('tcgvault_histories');
    localStorage.removeItem('tcgvault_notifications');
    localStorage.removeItem('tcgvault_price_alerts');
  }
}

export const supabasePriceService = new SupabasePriceService();
