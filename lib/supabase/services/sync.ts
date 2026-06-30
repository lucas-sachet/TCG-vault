import { PriceSnapshot, CardLanguage, GoalType } from '@/src/types';
import type { CollectionItem, WishlistItem } from '@/src/types';
import { buildDefaultBinderId } from '@/src/constants/defaultBinder';
import { supabase } from '@/src/services/supabaseClient';
import { ensureDefaultBinder, ensureUserProfile } from './ensureUserSetup';
import { supabaseCardService } from './card.service';
import { supabaseHoldingService } from './holding.service';
import { supabaseWishlistService } from './wishlist.service';
import { supabaseBinderService } from './binder.service';
import { supabaseBinderSlotService } from './binderSlot.service';
import { supabasePriceService } from './price.service';
import { supabaseGoalService } from './goal.service';
import { supabaseSettingsService } from './settings.service';

export async function syncFromSupabase(userId: string, userEmail: string): Promise<void> {
  try {
    await ensureUserProfile(userId);
    await ensureDefaultBinder(userId);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      supabaseSettingsService.setProfile(profile);

      if (profile.display_name) {
        localStorage.setItem(`pokevault_displayName_${userEmail}`, profile.display_name);
      }
      if (profile.nickname) {
        localStorage.setItem(`pokevault_nickname_${userEmail}`, profile.nickname);
      }
      if (profile.country) {
        localStorage.setItem(`pokevault_country_${userEmail}`, profile.country);
      }
      if (profile.about_me) {
        localStorage.setItem(`pokevault_aboutMe_${userEmail}`, profile.about_me);
      }
      if (profile.collector_since) {
        localStorage.setItem(`pokevault_collectorSince_${userEmail}`, profile.collector_since);
      }
      if (profile.profile_pic) {
        localStorage.setItem(`pokevault_profilePic_${userEmail}`, profile.profile_pic);
      }
      if (profile.languages) {
        localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(profile.languages));
      }
      if (profile.show_purchase_prices !== undefined) {
        localStorage.setItem(`pokevault_showPurchasePrices_${userEmail}`, String(profile.show_purchase_prices));
      }
      if (profile.show_roi !== undefined) {
        localStorage.setItem(`pokevault_showROI_${userEmail}`, String(profile.show_roi));
      }
      if (profile.show_collection_value !== undefined) {
        localStorage.setItem(`pokevault_showCollectionValue_${userEmail}`, String(profile.show_collection_value));
      }
      if (profile.collector_profile) {
        localStorage.setItem(`pokevault_collectorProfile_${userEmail}`, profile.collector_profile);
      }
      localStorage.setItem(`pokevault_onboarded_${userEmail}`, String(profile.onboarded));
    }

    const { data: binders } = await supabase
      .from('binders')
      .select('*')
      .eq('user_id', userId);

    if (binders) {
      supabaseBinderService.setBinders(binders.map((binder) => ({
        id: binder.id,
        name: binder.name,
        description: binder.description || undefined,
        coverCardId: binder.cover_card_id || undefined,
        createdAt: binder.created_at ?? '',
        isDefault: binder.is_default ?? false,
      })));
    }

    const defaultBinderId =
      binders?.find((binder) => binder.is_default)?.id ?? buildDefaultBinderId(userId);

    const { data: binderSlots } = await supabase
      .from('binder_slots')
      .select('*')
      .eq('user_id', userId);

    if (binderSlots) {
      supabaseBinderSlotService.setBinderSlots(
        binderSlots.map((slot) => ({
          id: slot.id,
          binderId: slot.binder_id,
          pageNumber: slot.page_number,
          slotNumber: slot.slot_number,
          collectionItemId: slot.collection_item_id,
        })),
      );
    }

    const { data: holdings } = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', userId);

    if (holdings) {
      supabaseHoldingService.setHoldings(holdings.map((holding) => ({
        id: holding.id,
        cardId: holding.card_id,
        purchaseDate: holding.purchase_date ?? '',
        purchasePrice: Number(holding.purchase_price ?? 0),
        currency: holding.currency ?? 'USD',
        quantity: holding.quantity ?? 1,
        notes: holding.notes || undefined,
        gradeType: (holding.grade_type ?? 'Raw') as CollectionItem['gradeType'],
        gradeValue: holding.grade_value
          ? (Number.isNaN(Number(holding.grade_value)) ? holding.grade_value : Number(holding.grade_value))
          : undefined,
        certNumber: holding.cert_number || undefined,
        binderId: holding.binder_id || defaultBinderId,
        quality: holding.quality as CollectionItem['quality'],
        frontPhotoUrl: holding.front_photo_url || undefined,
        backPhotoUrl: holding.back_photo_url || undefined,
      })));
    }

    const { data: wishlist } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId);

    if (wishlist) {
      supabaseWishlistService.setWishlistItems(wishlist.map((item) => ({
        id: item.id,
        cardId: item.card_id,
        desiredPrice: Number(item.desired_price ?? 0),
        currentMarketPrice: Number(item.current_market_price ?? 0),
        priority: (item.priority ?? 'Medium') as WishlistItem['priority'],
        notes: item.notes || undefined,
        language: (item.language ?? 'EN') as CardLanguage,
      })));
    }

    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (goals) {
      supabaseGoalService.setGoals(goals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        type: goal.type as GoalType,
        targetValue: goal.target_value ?? '',
        createdAt: goal.created_at ?? '',
      })));
    }

    const { data: notifications } = await supabase
      .from('price_notifications')
      .select('*')
      .eq('user_id', userId);

    if (notifications) {
      supabasePriceService.setNotifications(notifications.map((notification) => ({
        id: notification.id,
        cardId: notification.card_id,
        cardName: notification.card_name ?? '',
        language: (notification.language ?? 'EN') as CardLanguage,
        oldPrice: Number(notification.old_price ?? 0),
        newPrice: Number(notification.new_price ?? 0),
        changePercent: Number(notification.change_percent ?? 0),
        timestamp: notification.timestamp ?? '',
        isRead: notification.is_read ?? false,
      })));
    }

    const { data: alerts } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId);

    if (alerts) {
      const mappedAlerts: Record<string, { enabled: boolean; targetPrice: number }> = {};
      alerts.forEach((alert) => {
        mappedAlerts[alert.card_id] = {
          enabled: alert.enabled ?? false,
          targetPrice: Number(alert.target_price),
        };
      });
      supabasePriceService.setPriceAlerts(mappedAlerts);
    }

    const cardIds = new Set<string>();

    if (binders) {
      binders.forEach((binder) => {
        if (binder.cover_card_id) {
          cardIds.add(binder.cover_card_id);
        }
      });
    }
    if (holdings) {
      holdings.forEach((holding) => {
        if (holding.card_id) {
          cardIds.add(holding.card_id);
        }
      });
    }
    if (wishlist) {
      wishlist.forEach((item) => {
        if (item.card_id) {
          cardIds.add(item.card_id);
        }
      });
    }
    if (notifications) {
      notifications.forEach((notification) => {
        if (notification.card_id) {
          cardIds.add(notification.card_id);
        }
      });
    }
    if (alerts) {
      alerts.forEach((alert) => {
        if (alert.card_id) {
          cardIds.add(alert.card_id);
        }
      });
    }

    if (cardIds.size > 0) {
      const { data: cards } = await supabase
        .from('cards')
        .select('*')
        .in('id', Array.from(cardIds));

      if (cards) {
        supabaseCardService.setCards(cards.map((card) => ({
          id: card.id,
          name: card.name,
          set: card.set ?? '',
          number: card.number ?? '',
          rarity: card.rarity ?? '',
          language: (card.language ?? 'EN') as CardLanguage,
          imageUrl: card.image_url ?? '',
          supertype: card.supertype || undefined,
          subtypes: card.subtypes || undefined,
        })));
      }
    } else {
      supabaseCardService.setCards([]);
    }

    if (cardIds.size > 0) {
      const { data: marketPrices } = await supabase
        .from('market_prices')
        .select('*')
        .in('card_id', Array.from(cardIds));

      if (marketPrices) {
        const mappedPrices: Record<string, number> = {};
        marketPrices.forEach((marketPrice) => {
          mappedPrices[marketPrice.card_id] = Number(marketPrice.price);
        });
        supabasePriceService.setMarketPrices(mappedPrices);
      }
    } else {
      supabasePriceService.setMarketPrices({});
    }

    if (cardIds.size > 0) {
      const { data: histories } = await supabase
        .from('price_history')
        .select('*')
        .eq('user_id', userId)
        .in('card_id', Array.from(cardIds));

      if (histories) {
        const mappedHistories: Record<string, PriceSnapshot[]> = {};
        histories.forEach((history) => {
          if (!mappedHistories[history.card_id]) {
            mappedHistories[history.card_id] = [];
          }
          mappedHistories[history.card_id].push({
            cardId: history.card_id,
            marketPrice: Number(history.market_price),
            capturedAt: history.captured_at,
          });
        });
        supabasePriceService.setPriceHistories(mappedHistories);
      }
    } else {
      supabasePriceService.setPriceHistories({});
    }
  } catch (error) {
    console.error('Error synchronizing from Supabase:', error);
  }
}

export function clearSupabaseCache(userEmail?: string): void {
  supabaseCardService.setCards([]);
  supabaseHoldingService.setHoldings([]);
  supabaseWishlistService.setWishlistItems([]);
  supabaseBinderService.setBinders([]);
  supabaseBinderSlotService.setBinderSlots([]);
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
