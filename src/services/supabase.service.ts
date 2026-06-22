/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CollectionItem, WishlistItem, Binder, PriceSnapshot, PriceNotification, CollectionGoal } from '../types';
import { ICardService, IHoldingService, IWishlistService, IBinderService, IPriceService, IGoalService, ISettingsService } from './interfaces';
import { supabase } from './supabaseClient';

export class SupabaseCardService implements ICardService {
  private cache: Card[] = [];

  getCards(): Card[] {
    return this.cache;
  }

  setCards(cards: Card[]): void {
    this.cache = cards;
    localStorage.setItem('tcgvault_cards', JSON.stringify(cards));
  }

  async saveCards(cards: Card[]): Promise<void> {
    this.cache = cards;
    localStorage.setItem('tcgvault_cards', JSON.stringify(cards));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    if (cards.length === 0) return;

    const dbCards = cards.map(c => ({
      id: c.id,
      name: c.name,
      set: c.set,
      number: c.number,
      rarity: c.rarity,
      language: c.language,
      image_url: c.imageUrl,
      supertype: c.supertype || null,
      subtypes: c.subtypes || null
    }));

    try {
      await supabase.from('cards').upsert(dbCards);
    } catch (err) {
      console.error('Error saving cards to Supabase:', err);
    }
  }
}

export class SupabaseHoldingService implements IHoldingService {
  private cache: CollectionItem[] = [];

  getHoldings(): CollectionItem[] {
    return this.cache;
  }

  setHoldings(holdings: CollectionItem[]): void {
    this.cache = holdings;
    localStorage.setItem('tcgvault_collection', JSON.stringify(holdings));
  }

  async saveHoldings(holdings: CollectionItem[]): Promise<void> {
    this.cache = holdings;
    localStorage.setItem('tcgvault_collection', JSON.stringify(holdings));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const userId = session.user.id;

    try {
      // 1. Sync deletions first: delete items in DB that are not in the local holdings
      const localIds = holdings.map(h => h.id);
      if (localIds.length > 0) {
        // Construct standard SQL formatting for lists
        await supabase
          .from('collection_items')
          .delete()
          .eq('user_id', userId)
          .not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await supabase
          .from('collection_items')
          .delete()
          .eq('user_id', userId);
      }

      if (holdings.length === 0) return;

      // 2. Upsert the current holdings
      const dbHoldings = holdings.map(h => ({
        id: h.id,
        card_id: h.cardId,
        purchase_date: h.purchaseDate,
        purchase_price: h.purchasePrice,
        currency: h.currency,
        quantity: h.quantity,
        notes: h.notes || null,
        grade_type: h.gradeType,
        grade_value: h.gradeValue !== undefined ? String(h.gradeValue) : null,
        cert_number: h.certNumber || null,
        binder_id: h.binderId || null,
        quality: h.quality || null,
        front_photo_url: h.frontPhotoUrl || null,
        back_photo_url: h.backPhotoUrl || null,
        user_id: userId
      }));

      await supabase.from('collection_items').upsert(dbHoldings);
    } catch (err) {
      console.error('Error saving holdings to Supabase:', err);
    }
  }
}

export class SupabaseWishlistService implements IWishlistService {
  private cache: WishlistItem[] = [];

  getWishlistItems(): WishlistItem[] {
    return this.cache;
  }

  setWishlistItems(items: WishlistItem[]): void {
    this.cache = items;
    localStorage.setItem('tcgvault_wishlist', JSON.stringify(items));
  }

  async saveWishlistItems(items: WishlistItem[]): Promise<void> {
    this.cache = items;
    localStorage.setItem('tcgvault_wishlist', JSON.stringify(items));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const userId = session.user.id;

    try {
      const localIds = items.map(i => i.id);
      if (localIds.length > 0) {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId)
          .not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId);
      }

      if (items.length === 0) return;

      const dbItems = items.map(i => ({
        id: i.id,
        card_id: i.cardId,
        desired_price: i.desiredPrice,
        current_market_price: i.currentMarketPrice,
        priority: i.priority,
        notes: i.notes || null,
        language: i.language,
        user_id: userId
      }));

      await supabase.from('wishlist_items').upsert(dbItems);
    } catch (err) {
      console.error('Error saving wishlist items to Supabase:', err);
    }
  }
}

export class SupabaseBinderService implements IBinderService {
  private cache: Binder[] = [];

  getBinders(): Binder[] {
    return this.cache;
  }

  setBinders(binders: Binder[]): void {
    this.cache = binders;
    localStorage.setItem('tcgvault_binders', JSON.stringify(binders));
  }

  async saveBinders(binders: Binder[]): Promise<void> {
    this.cache = binders;
    localStorage.setItem('tcgvault_binders', JSON.stringify(binders));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const userId = session.user.id;

    try {
      const localIds = binders.map(b => b.id);
      if (localIds.length > 0) {
        await supabase
          .from('binders')
          .delete()
          .eq('user_id', userId)
          .not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await supabase
          .from('binders')
          .delete()
          .eq('user_id', userId);
      }

      if (binders.length === 0) return;

      const dbBinders = binders.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description || null,
        cover_card_id: b.coverCardId || null,
        user_id: userId,
        created_at: b.createdAt
      }));

      await supabase.from('binders').upsert(dbBinders);
    } catch (err) {
      console.error('Error saving binders to Supabase:', err);
    }
  }
}

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

  async saveMarketPrices(prices: Record<string, number>): Promise<void> {
    this.marketPrices = prices;
    localStorage.setItem('tcgvault_prices', JSON.stringify(prices));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const dbPrices = Object.entries(prices).map(([cardId, price]) => ({
      card_id: cardId,
      price: price
    }));

    if (dbPrices.length === 0) return;

    try {
      await supabase.from('market_prices').upsert(dbPrices);
    } catch (err) {
      console.error('Error saving market prices to Supabase:', err);
    }
  }

  getPriceHistories(): Record<string, PriceSnapshot[]> {
    return this.priceHistories;
  }

  setPriceHistories(histories: Record<string, PriceSnapshot[]>): void {
    this.priceHistories = histories;
    localStorage.setItem('tcgvault_histories', JSON.stringify(histories));
  }

  async savePriceHistories(histories: Record<string, PriceSnapshot[]>): Promise<void> {
    this.priceHistories = histories;
    localStorage.setItem('tcgvault_histories', JSON.stringify(histories));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const dbHistories: any[] = [];
    Object.values(histories).forEach(snaps => {
      snaps.forEach(snap => {
        dbHistories.push({
          card_id: snap.cardId,
          market_price: snap.marketPrice,
          captured_at: snap.capturedAt
        });
      });
    });

    if (dbHistories.length === 0) return;

    try {
      await supabase.from('price_history').upsert(dbHistories);
    } catch (err) {
      console.error('Error saving price history to Supabase:', err);
    }
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
    if (!session?.user?.id) return;

    const userId = session.user.id;

    try {
      const localIds = notifications.map(n => n.id);
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

      if (notifications.length === 0) return;

      const dbNotifications = notifications.map(n => ({
        id: n.id,
        card_id: n.cardId,
        card_name: n.cardName,
        language: n.language,
        old_price: n.oldPrice,
        new_price: n.newPrice,
        change_percent: n.changePercent,
        timestamp: n.timestamp,
        is_read: n.isRead,
        user_id: userId
      }));

      await supabase.from('price_notifications').upsert(dbNotifications);
    } catch (err) {
      console.error('Error saving price notifications to Supabase:', err);
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
    if (!session?.user?.id) return;

    const userId = session.user.id;

    try {
      // For price alerts (composite key card_id, user_id), delete and recreate is simpler
      await supabase.from('price_alerts').delete().eq('user_id', userId);

      const dbAlerts = Object.entries(alerts).map(([cardId, val]) => ({
        card_id: cardId,
        user_id: userId,
        target_price: val.targetPrice,
        enabled: val.enabled
      }));

      if (dbAlerts.length === 0) return;

      await supabase.from('price_alerts').insert(dbAlerts);
    } catch (err) {
      console.error('Error saving price alerts to Supabase:', err);
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

export class SupabaseGoalService implements IGoalService {
  private cache: CollectionGoal[] = [];

  getGoals(): CollectionGoal[] {
    return this.cache;
  }

  setGoals(goals: CollectionGoal[]): void {
    this.cache = goals;
    localStorage.setItem('tcgvault_goals', JSON.stringify(goals));
  }

  async saveGoals(goals: CollectionGoal[]): Promise<void> {
    this.cache = goals;
    localStorage.setItem('tcgvault_goals', JSON.stringify(goals));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const userId = session.user.id;

    try {
      const localIds = goals.map(g => g.id);
      if (localIds.length > 0) {
        await supabase
          .from('goals')
          .delete()
          .eq('user_id', userId)
          .not('id', 'in', `(${localIds.join(',')})`);
      } else {
        await supabase
          .from('goals')
          .delete()
          .eq('user_id', userId);
      }

      if (goals.length === 0) return;

      const dbGoals = goals.map(g => ({
        id: g.id,
        name: g.name,
        type: g.type,
        target_value: g.targetValue,
        user_id: userId,
        created_at: g.createdAt
      }));

      await supabase.from('goals').upsert(dbGoals);
    } catch (err) {
      console.error('Error saving goals to Supabase:', err);
    }
  }
}

export class SupabaseSettingsService implements ISettingsService {
  private preferSpecimenPhoto: boolean = false;
  private onboarded: boolean = false;
  private languages: string[] = [];

  getPreferSpecimenPhoto(): boolean {
    return this.preferSpecimenPhoto;
  }

  setPreferSpecimenPhoto(value: boolean): void {
    this.preferSpecimenPhoto = value;
    localStorage.setItem('preferSpecimenPhoto', String(value));
    this.saveSettings();
  }

  getOnboarded(): boolean {
    return this.onboarded;
  }

  setOnboarded(value: boolean): void {
    this.onboarded = value;
    this.saveSettings();
  }

  getLanguages(): string[] {
    return this.languages;
  }

  setLanguages(value: string[]): void {
    this.languages = value;
    this.saveSettings();
  }

  setProfile(profile: any): void {
    this.preferSpecimenPhoto = profile.prefer_specimen_photo;
    this.onboarded = profile.onboarded;
    this.languages = profile.languages || [];
    localStorage.setItem('preferSpecimenPhoto', String(profile.prefer_specimen_photo));
  }

  async saveSettings(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    try {
      await supabase.from('profiles').update({
        prefer_specimen_photo: this.preferSpecimenPhoto,
        onboarded: this.onboarded,
        languages: this.languages
      }).eq('id', session.user.id);
    } catch (err) {
      console.error('Error updating settings in Supabase:', err);
    }
  }

  resetSettings(): void {
    this.preferSpecimenPhoto = false;
    this.onboarded = false;
    this.languages = [];
    localStorage.removeItem('preferSpecimenPhoto');
  }
}

// Singleton instances
export const supabaseCardService = new SupabaseCardService();
export const supabaseHoldingService = new SupabaseHoldingService();
export const supabaseWishlistService = new SupabaseWishlistService();
export const supabaseBinderService = new SupabaseBinderService();
export const supabasePriceService = new SupabasePriceService();
export const supabaseGoalService = new SupabaseGoalService();
export const supabaseSettingsService = new SupabaseSettingsService();

export async function syncFromSupabase(userId: string, userEmail: string): Promise<void> {
  try {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      supabaseSettingsService.setProfile(profile);

      // Save to local storage for settings sync in front-end
      if (profile.display_name) localStorage.setItem(`pokevault_displayName_${userEmail}`, profile.display_name);
      if (profile.nickname) localStorage.setItem(`pokevault_nickname_${userEmail}`, profile.nickname);
      if (profile.country) localStorage.setItem(`pokevault_country_${userEmail}`, profile.country);
      if (profile.about_me) localStorage.setItem(`pokevault_aboutMe_${userEmail}`, profile.about_me);
      if (profile.collector_since) localStorage.setItem(`pokevault_collectorSince_${userEmail}`, profile.collector_since);
      if (profile.profile_pic) localStorage.setItem(`pokevault_profilePic_${userEmail}`, profile.profile_pic);
      if (profile.languages) localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(profile.languages));
      if (profile.show_purchase_prices !== undefined) localStorage.setItem(`pokevault_showPurchasePrices_${userEmail}`, String(profile.show_purchase_prices));
      if (profile.show_roi !== undefined) localStorage.setItem(`pokevault_showROI_${userEmail}`, String(profile.show_roi));
      if (profile.show_collection_value !== undefined) localStorage.setItem(`pokevault_showCollectionValue_${userEmail}`, String(profile.show_collection_value));
      if (profile.collector_profile) localStorage.setItem(`pokevault_collectorProfile_${userEmail}`, profile.collector_profile);
      localStorage.setItem(`pokevault_onboarded_${userEmail}`, String(profile.onboarded));
    }

    // 2. Fetch Binders
    const { data: binders } = await supabase
      .from('binders')
      .select('*')
      .eq('user_id', userId);

    if (binders) {
      supabaseBinderService.setBinders(binders.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description || undefined,
        coverCardId: b.cover_card_id || undefined,
        createdAt: b.created_at
      })));
    }

    // 3. Fetch Cards
    const { data: cards } = await supabase
      .from('cards')
      .select('*');

    if (cards) {
      supabaseCardService.setCards(cards.map(c => ({
        id: c.id,
        name: c.name,
        set: c.set,
        number: c.number,
        rarity: c.rarity,
        language: c.language as any,
        imageUrl: c.image_url,
        supertype: c.supertype || undefined,
        subtypes: c.subtypes || undefined
      })));
    }

    // 4. Fetch Collection Items
    const { data: holdings } = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', userId);

    if (holdings) {
      supabaseHoldingService.setHoldings(holdings.map(h => ({
        id: h.id,
        cardId: h.card_id,
        purchaseDate: h.purchase_date,
        purchasePrice: Number(h.purchase_price),
        currency: h.currency,
        quantity: h.quantity,
        notes: h.notes || undefined,
        gradeType: h.grade_type as any,
        gradeValue: h.grade_value ? (isNaN(Number(h.grade_value)) ? h.grade_value : Number(h.grade_value)) : undefined,
        certNumber: h.cert_number || undefined,
        binderId: h.binder_id || undefined,
        quality: h.quality as any,
        frontPhotoUrl: h.front_photo_url || undefined,
        backPhotoUrl: h.back_photo_url || undefined
      })));
    }

    // 5. Fetch Wishlist Items
    const { data: wishlist } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId);

    if (wishlist) {
      supabaseWishlistService.setWishlistItems(wishlist.map(w => ({
        id: w.id,
        cardId: w.card_id,
        desiredPrice: Number(w.desired_price),
        currentMarketPrice: Number(w.current_market_price),
        priority: w.priority as any,
        notes: w.notes || undefined,
        language: w.language as any
      })));
    }

    // 6. Fetch Goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (goals) {
      supabaseGoalService.setGoals(goals.map(g => ({
        id: g.id,
        name: g.name,
        type: g.type as any,
        targetValue: g.target_value,
        createdAt: g.created_at
      })));
    }

    // 7. Fetch Price Notifications
    const { data: notifications } = await supabase
      .from('price_notifications')
      .select('*')
      .eq('user_id', userId);

    if (notifications) {
      supabasePriceService.setNotifications(notifications.map(n => ({
        id: n.id,
        cardId: n.card_id,
        cardName: n.card_name,
        language: n.language as any,
        oldPrice: Number(n.old_price),
        newPrice: Number(n.new_price),
        changePercent: Number(n.change_percent),
        timestamp: n.timestamp,
        isRead: n.is_read
      })));
    }

    // 8. Fetch Price Alerts
    const { data: alerts } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId);

    if (alerts) {
      const mappedAlerts: Record<string, { enabled: boolean; targetPrice: number }> = {};
      alerts.forEach(a => {
        mappedAlerts[a.card_id] = {
          enabled: a.enabled,
          targetPrice: Number(a.target_price)
        };
      });
      supabasePriceService.setPriceAlerts(mappedAlerts);
    }

    // 9. Fetch Market Prices
    const { data: marketPrices } = await supabase
      .from('market_prices')
      .select('*');

    if (marketPrices) {
      const mappedPrices: Record<string, number> = {};
      marketPrices.forEach(mp => {
        mappedPrices[mp.card_id] = Number(mp.price);
      });
      supabasePriceService.setMarketPrices(mappedPrices);
    }

    // 10. Fetch Price Histories
    const { data: histories } = await supabase
      .from('price_history')
      .select('*');

    if (histories) {
      const mappedHistories: Record<string, PriceSnapshot[]> = {};
      histories.forEach(h => {
        if (!mappedHistories[h.card_id]) {
          mappedHistories[h.card_id] = [];
        }
        mappedHistories[h.card_id].push({
          cardId: h.card_id,
          marketPrice: Number(h.market_price),
          capturedAt: h.captured_at
        });
      });
      supabasePriceService.setPriceHistories(mappedHistories);
    }
  } catch (err) {
    console.error('Error synchronizing from Supabase:', err);
  }
}

export function clearSupabaseCache(userEmail?: string): void {
  supabaseCardService.setCards([]);
  supabaseHoldingService.setHoldings([]);
  supabaseWishlistService.setWishlistItems([]);
  supabaseBinderService.setBinders([]);
  supabasePriceService.clearPrices();
  supabaseGoalService.setGoals([]);
  supabaseSettingsService.resetSettings();

  if (userEmail) {
    localStorage.removeItem(`pokevault_onboarded_${userEmail}`);
    localStorage.removeItem(`pokevault_languages_${userEmail}`);
    localStorage.removeItem(`pokevault_goals_${userEmail}`);
    localStorage.removeItem(`pokevault_displayName_${userEmail}`);
    localStorage.removeItem(`pokevault_country_${userEmail}`);
    localStorage.removeItem(`pokevault_aboutMe_${userEmail}`);
    localStorage.removeItem(`pokevault_profilePic_${userEmail}`);
    localStorage.removeItem(`pokevault_collectorSince_${userEmail}`);
    localStorage.removeItem(`pokevault_collectorProfile_${userEmail}`);
    localStorage.removeItem(`pokevault_showPurchasePrices_${userEmail}`);
    localStorage.removeItem(`pokevault_showROI_${userEmail}`);
    localStorage.removeItem(`pokevault_showCollectionValue_${userEmail}`);
    localStorage.removeItem(`pokevault_defaultBinder_${userEmail}`);
  }
}
