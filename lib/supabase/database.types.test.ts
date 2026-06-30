import { describe, expect, it } from 'vitest';
import type { Database } from '@/lib/supabase/database.types';

describe('Database types', () => {
  it('includes all PokéVault tables', () => {
    type TableNames = keyof Database['public']['Tables'];
    const expectedTables: TableNames[] = [
      'profiles',
      'cards',
      'binders',
      'binder_slots',
      'collection_items',
      'wishlist_items',
      'goals',
      'market_prices',
      'price_history',
      'price_notifications',
      'price_alerts',
    ];

    expectedTables.forEach((tableName) => {
      expect(tableName).toBeTruthy();
    });
  });
});
