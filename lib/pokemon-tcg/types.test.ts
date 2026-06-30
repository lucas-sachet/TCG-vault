import { describe, expect, it } from 'vitest';
import { extractMarketPriceFromTcgCard } from '@/lib/pokemon-tcg/types';

describe('extractMarketPriceFromTcgCard', () => {
  it('prioritizes holofoil market price', () => {
    const price = extractMarketPriceFromTcgCard({
      id: 'sv1-1',
      name: 'Test',
      number: '1',
      images: { small: '', large: '' },
      set: { id: 'sv1', name: 'Scarlet & Violet' },
      tcgplayer: {
        prices: {
          normal: { market: 1 },
          holofoil: { market: 10 },
        },
      },
    });

    expect(price).toBe(10);
  });
});
