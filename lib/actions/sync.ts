'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { clearSupabaseCache, syncFromSupabase } from '@/lib/supabase';

export async function syncUserDataAction(userId: string, userEmail: string) {
  await syncFromSupabase(userId, userEmail);
  return { success: true };
}

export async function clearUserCacheAction(userEmail?: string) {
  clearSupabaseCache(userEmail);
  return { success: true };
}

export async function exportUserDataAction(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [
    profileResult,
    bindersResult,
    holdingsResult,
    wishlistResult,
    goalsResult,
    notificationsResult,
    alertsResult,
    binderSlotsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('binders').select('*').eq('user_id', userId),
    supabase.from('collection_items').select('*').eq('user_id', userId),
    supabase.from('wishlist_items').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId),
    supabase.from('price_notifications').select('*').eq('user_id', userId),
    supabase.from('price_alerts').select('*').eq('user_id', userId),
    supabase.from('binder_slots').select('*').eq('user_id', userId),
  ]);

  const userCardIds = [
    ...(holdingsResult.data ?? []).map((holding) => holding.card_id),
    ...(wishlistResult.data ?? []).map((item) => item.card_id),
  ];
  const uniqueCardIds = [...new Set(userCardIds)];

  const priceHistoryResult = uniqueCardIds.length > 0
    ? await supabase.from('price_history').select('*').eq('user_id', userId).in('card_id', uniqueCardIds)
    : { data: [] };

  return {
    exportedAt: new Date().toISOString(),
    profile: profileResult.data,
    binders: bindersResult.data ?? [],
    collectionItems: holdingsResult.data ?? [],
    wishlistItems: wishlistResult.data ?? [],
    goals: goalsResult.data ?? [],
    priceHistory: priceHistoryResult.data ?? [],
    priceNotifications: notificationsResult.data ?? [],
    priceAlerts: alertsResult.data ?? [],
    binderSlots: binderSlotsResult.data ?? [],
  };
}
