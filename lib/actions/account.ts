'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const tables = [
    'binder_slots',
    'price_alerts',
    'price_notifications',
    'goals',
    'wishlist_items',
    'collection_items',
    'binders',
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.error(`Failed to delete from ${table}:`, error.message);
    }
  }

  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
  if (profileError) {
    return { success: false, error: profileError.message };
  }

  return { success: true };
}
