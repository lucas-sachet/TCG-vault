import { CollectionItem } from '@/src/types';
import { IHoldingService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';

export class SupabaseHoldingService implements IHoldingService {
  private cache: CollectionItem[] = [];

  getHoldings(): CollectionItem[] {
    return this.cache;
  }

  setHoldings(holdings: CollectionItem[]): void {
    this.cache = holdings;
    localStorage.setItem('tcgvault_collection', JSON.stringify(holdings));
  }

  async saveHoldings(holdings: CollectionItem[]): Promise<boolean> {
    this.cache = holdings;
    localStorage.setItem('tcgvault_collection', JSON.stringify(holdings));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return true;
    }

    const userId = session.user.id;

    const localIds = holdings.map((holding) => holding.id);
    if (localIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('collection_items')
        .delete()
        .eq('user_id', userId)
        .not('id', 'in', `(${localIds.join(',')})`);

      if (deleteError) {
        console.error('Error deleting removed holdings:', deleteError);
        return false;
      }
    } else {
      const { error: deleteAllError } = await supabase
        .from('collection_items')
        .delete()
        .eq('user_id', userId);

      if (deleteAllError) {
        console.error('Error deleting holdings:', deleteAllError);
        return false;
      }

      return true;
    }

    if (holdings.length === 0) {
      return true;
    }

    const databaseHoldings = holdings.map((holding) => ({
      id: holding.id,
      card_id: holding.cardId,
      purchase_date: holding.purchaseDate,
      purchase_price: holding.purchasePrice,
      currency: holding.currency,
      quantity: holding.quantity,
      notes: holding.notes || null,
      grade_type: holding.gradeType,
      grade_value: holding.gradeValue !== undefined ? String(holding.gradeValue) : null,
      cert_number: holding.certNumber || null,
      binder_id: holding.binderId || null,
      quality: holding.quality || null,
      front_photo_url: holding.frontPhotoUrl || null,
      back_photo_url: holding.backPhotoUrl || null,
      user_id: userId,
    }));

    const { error: upsertError } = await supabase.from('collection_items').upsert(databaseHoldings);
    if (upsertError) {
      console.error('Error saving holdings to Supabase:', upsertError);
      return false;
    }

    return true;
  }
}

export const supabaseHoldingService = new SupabaseHoldingService();
