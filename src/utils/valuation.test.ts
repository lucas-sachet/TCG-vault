import { describe, expect, it } from 'vitest';
import {
  calculateHoldingMarketValue,
  calculatePortfolioValue,
  getGradedPriceMultiplier,
} from '@/src/utils/valuation';
import type { CollectionItem } from '@/src/types';

const baseHolding: CollectionItem = {
  id: 'holding-1',
  cardId: 'sv1-1',
  purchaseDate: '2026-01-01',
  purchasePrice: 100,
  currency: 'USD',
  quantity: 1,
  gradeType: 'Raw',
};

describe('valuation', () => {
  it('returns raw multiplier of 1 for ungraded cards', () => {
    expect(getGradedPriceMultiplier('Raw', 'Raw')).toBe(1);
  });

  it('applies PSA 10 multiplier', () => {
    expect(getGradedPriceMultiplier('PSA', '10')).toBe(3.5);
  });

  it('calculates graded holding value', () => {
    const gradedHolding: CollectionItem = {
      ...baseHolding,
      gradeType: 'PSA',
      gradeValue: '10',
    };

    expect(calculateHoldingMarketValue(gradedHolding, 100)).toBe(350);
  });

  it('calculates portfolio value with graded multipliers', () => {
    const holdings: CollectionItem[] = [
      baseHolding,
      {
        ...baseHolding,
        id: 'holding-2',
        gradeType: 'PSA',
        gradeValue: '10',
      },
    ];

    expect(calculatePortfolioValue(holdings, { 'sv1-1': 100 })).toBe(450);
  });
});
