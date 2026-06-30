import { BinderSlot } from '@/src/types';
import { IBinderSlotService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';

function buildSlotId(binderId: string, pageNumber: number, slotNumber: number): string {
  return `slot-${binderId}-${pageNumber}-${slotNumber}`;
}

function dedupeSlotAssignments(slots: BinderSlot[]): BinderSlot[] {
  const seenCollectionItemIds = new Set<string>();

  return slots.map((slot) => {
    if (!slot.collectionItemId) {
      return slot;
    }

    if (seenCollectionItemIds.has(slot.collectionItemId)) {
      return { ...slot, collectionItemId: null };
    }

    seenCollectionItemIds.add(slot.collectionItemId);
    return slot;
  });
}

export class SupabaseBinderSlotService implements IBinderSlotService {
  private cache: BinderSlot[] = [];

  getBinderSlots(): BinderSlot[] {
    return this.cache;
  }

  setBinderSlots(slots: BinderSlot[]): void {
    this.cache = slots;
    localStorage.setItem('tcgvault_binder_slots', JSON.stringify(slots));
  }

  async saveBinderSlots(slots: BinderSlot[]): Promise<boolean> {
    const normalizedSlots = dedupeSlotAssignments(slots);
    this.cache = normalizedSlots;
    localStorage.setItem('tcgvault_binder_slots', JSON.stringify(normalizedSlots));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return true;
    }

    const userId = session.user.id;

    const assignedCollectionItemIds = [
      ...new Set(
        normalizedSlots
          .map((slot) => slot.collectionItemId)
          .filter((collectionItemId): collectionItemId is string => Boolean(collectionItemId)),
      ),
    ];

    if (assignedCollectionItemIds.length > 0) {
      const { error: clearAssignmentsError } = await supabase
        .from('binder_slots')
        .update({ collection_item_id: null })
        .eq('user_id', userId)
        .in('collection_item_id', assignedCollectionItemIds);

      if (clearAssignmentsError) {
        console.error('Error clearing binder slot assignments:', clearAssignmentsError);
        return false;
      }
    }

    const localIds = normalizedSlots.map((slot) => slot.id);
    if (localIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('binder_slots')
        .delete()
        .eq('user_id', userId)
        .not('id', 'in', `(${localIds.join(',')})`);

      if (deleteError) {
        console.error('Error deleting removed binder slots:', deleteError);
        return false;
      }
    } else {
      const { error: deleteAllError } = await supabase
        .from('binder_slots')
        .delete()
        .eq('user_id', userId);

      if (deleteAllError) {
        console.error('Error deleting binder slots:', deleteAllError);
        return false;
      }

      return true;
    }

    const databaseSlots = normalizedSlots.map((slot) => ({
      id: slot.id,
      user_id: userId,
      binder_id: slot.binderId,
      page_number: slot.pageNumber,
      slot_number: slot.slotNumber,
      collection_item_id: slot.collectionItemId,
    }));

    const { error: upsertError } = await supabase.from('binder_slots').upsert(databaseSlots);
    if (upsertError) {
      console.error('Error saving binder slots to Supabase:', upsertError);
      return false;
    }

    return true;
  }

  createSlotRecord(
    binderId: string,
    pageNumber: number,
    slotNumber: number,
    collectionItemId: string | null,
  ): BinderSlot {
    return {
      id: buildSlotId(binderId, pageNumber, slotNumber),
      binderId,
      pageNumber,
      slotNumber,
      collectionItemId,
    };
  }
}

export const supabaseBinderSlotService = new SupabaseBinderSlotService();
