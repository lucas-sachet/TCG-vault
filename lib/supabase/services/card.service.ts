import { Card } from '@/src/types';
import { ICardService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';
import { supabasePriceService } from './price.service';

export class SupabaseCardService implements ICardService {
  private cache: Card[] = [];

  getCards(): Card[] {
    return this.cache;
  }

  setCards(cards: Card[]): void {
    this.cache = cards;
    localStorage.setItem('tcgvault_cards', JSON.stringify(cards));
  }

  async saveCards(cards: Card[]): Promise<boolean> {
    this.cache = cards;
    localStorage.setItem('tcgvault_cards', JSON.stringify(cards));

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return true;
    }

    if (cards.length === 0) {
      return true;
    }

    const databaseCards = cards.map((card) => ({
      id: card.id,
      name: card.name,
      set: card.set,
      number: card.number,
      rarity: card.rarity,
      language: card.language,
      image_url: card.imageUrl,
      supertype: card.supertype || null,
      subtypes: card.subtypes || null,
    }));

    const { error } = await supabase.from('cards').upsert(databaseCards);
    if (error) {
      console.error('Error saving cards to Supabase:', error);
      return false;
    }

    await supabasePriceService.syncMarketPricesForCardIds(cards.map((card) => card.id));
    return true;
  }
}

export const supabaseCardService = new SupabaseCardService();
