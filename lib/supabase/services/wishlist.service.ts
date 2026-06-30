import { WishlistItem } from '@/src/types';
import { IWishlistService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';

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
    if (!session?.user?.id) {
      return;
    }

    const userId = session.user.id;

    try {
      const localIds = items.map((item) => item.id);
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

      if (items.length === 0) {
        return;
      }

      const databaseItems = items.map((item) => ({
        id: item.id,
        card_id: item.cardId,
        desired_price: item.desiredPrice,
        current_market_price: item.currentMarketPrice,
        priority: item.priority,
        notes: item.notes || null,
        language: item.language,
        user_id: userId,
      }));

      await supabase.from('wishlist_items').upsert(databaseItems);
    } catch (error) {
      console.error('Error saving wishlist items to Supabase:', error);
    }
  }
}

export const supabaseWishlistService = new SupabaseWishlistService();
