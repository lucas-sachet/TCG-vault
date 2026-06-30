import { describe, expect, it } from 'vitest';
import {
  filterUnslottedHoldings,
  getBinderSlottedCount,
  getBinderTotalValue,
  getPageFillStats,
} from '@/src/features/binders/binderStats';
import type { BinderSlot, Card, CollectionItem } from '@/src/types';

const sampleSlots: BinderSlot[] = [
  {
    id: 'slot-1',
    binderId: 'binder-a',
    pageNumber: 0,
    slotNumber: 0,
    collectionItemId: 'holding-1',
  },
  {
    id: 'slot-2',
    binderId: 'binder-a',
    pageNumber: 0,
    slotNumber: 1,
    collectionItemId: 'holding-2',
  },
  {
    id: 'slot-3',
    binderId: 'binder-b',
    pageNumber: 0,
    slotNumber: 0,
    collectionItemId: 'holding-3',
  },
];

const sampleHoldings: CollectionItem[] = [
  {
    id: 'holding-1',
    cardId: 'card-1',
    purchaseDate: '2026-01-01',
    purchasePrice: 10,
    currency: 'USD',
    quantity: 1,
    gradeType: 'Raw',
    binderId: 'binder-a',
  },
  {
    id: 'holding-2',
    cardId: 'card-2',
    purchaseDate: '2026-01-01',
    purchasePrice: 20,
    currency: 'USD',
    quantity: 1,
    gradeType: 'Raw',
    binderId: 'binder-a',
  },
  {
    id: 'holding-3',
    cardId: 'card-3',
    purchaseDate: '2026-01-01',
    purchasePrice: 30,
    currency: 'USD',
    quantity: 1,
    gradeType: 'Raw',
    binderId: 'binder-b',
  },
  {
    id: 'holding-4',
    cardId: 'card-4',
    purchaseDate: '2026-01-01',
    purchasePrice: 40,
    currency: 'USD',
    quantity: 1,
    gradeType: 'Raw',
    binderId: 'binder-a',
  },
];

const sampleCards: Card[] = [
  { id: 'card-1', name: 'Pikachu', set: 'Base', number: '58', imageUrl: '', rarity: 'Common', language: 'EN' },
  { id: 'card-2', name: 'Charizard', set: 'Base', number: '4', imageUrl: '', rarity: 'Rare', language: 'EN' },
  { id: 'card-3', name: 'Mewtwo', set: 'Base', number: '10', imageUrl: '', rarity: 'Rare', language: 'EN' },
  { id: 'card-4', name: 'Blastoise', set: 'Base', number: '2', imageUrl: '', rarity: 'Rare', language: 'EN' },
];

describe('binderStats', () => {
  it('counts slotted holdings for a binder', () => {
    expect(getBinderSlottedCount('binder-a', sampleSlots)).toBe(2);
    expect(getBinderSlottedCount('binder-b', sampleSlots)).toBe(1);
  });

  it('calculates page fill stats', () => {
    const stats = getPageFillStats('binder-a', 0, sampleSlots, 9);
    expect(stats.filledCount).toBe(2);
    expect(stats.totalCount).toBe(9);
    expect(stats.fillPercentage).toBeCloseTo(22.222, 2);
  });

  it('sums binder total value from market prices', () => {
    const marketPrices = {
      'card-1': 15,
      'card-2': 25,
      'card-3': 35,
    };

    expect(
      getBinderTotalValue('binder-a', sampleSlots, sampleHoldings, sampleCards, marketPrices),
    ).toBe(40);
  });

  it('filters unslotted holdings for selected binder by default', () => {
    const slottedIds = new Set(['holding-1', 'holding-2', 'holding-3']);
    const filtered = filterUnslottedHoldings(
      sampleHoldings,
      slottedIds,
      'binder-a',
      false,
    );

    expect(filtered.map((holding) => holding.id)).toEqual(['holding-4']);
  });

  it('shows all unslotted holdings when toggle is enabled', () => {
    const slottedIds = new Set(['holding-1']);
    const filtered = filterUnslottedHoldings(
      sampleHoldings,
      slottedIds,
      'binder-a',
      true,
    );

    expect(filtered.map((holding) => holding.id)).toEqual([
      'holding-2',
      'holding-3',
      'holding-4',
    ]);
  });
});
