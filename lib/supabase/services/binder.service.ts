import { Binder } from '@/src/types';
import { IBinderService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';

export class SupabaseBinderService implements IBinderService {
  private cache: Binder[] = [];

  getBinders(): Binder[] {
    return this.cache;
  }

  setBinders(binders: Binder[]): void {
    this.cache = binders;
    localStorage.setItem('tcgvault_binders', JSON.stringify(binders));
  }

  async saveBinders(binders: Binder[]): Promise<boolean> {
    this.cache = binders;
    localStorage.setItem('tcgvault_binders', JSON.stringify(binders));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return true;
    }

    const userId = session.user.id;

    const localIds = binders.map((binder) => binder.id);
    if (localIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('binders')
        .delete()
        .eq('user_id', userId)
        .eq('is_default', false)
        .not('id', 'in', `(${localIds.join(',')})`);

      if (deleteError) {
        console.error('Error deleting removed binders:', deleteError);
        return false;
      }
    } else {
      const { error: deleteAllError } = await supabase
        .from('binders')
        .delete()
        .eq('user_id', userId)
        .eq('is_default', false);

      if (deleteAllError) {
        console.error('Error deleting binders:', deleteAllError);
        return false;
      }

      return true;
    }

    if (binders.length === 0) {
      return true;
    }

    const databaseBinders = binders.map((binder) => ({
      id: binder.id,
      name: binder.name,
      description: binder.description || null,
      cover_card_id: binder.coverCardId || null,
      user_id: userId,
      created_at: binder.createdAt,
      is_default: binder.isDefault ?? false,
    }));

    const { error } = await supabase.from('binders').upsert(databaseBinders);
    if (error) {
      console.error('Error saving binders to Supabase:', error);
      return false;
    }

    return true;
  }
}

export const supabaseBinderService = new SupabaseBinderService();
