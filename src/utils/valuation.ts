import type { CollectionItem } from '@/src/types';

type GradeType = CollectionItem['gradeType'];

const GRADE_MULTIPLIERS: Record<Exclude<GradeType, 'Raw'>, Record<string, number>> = {
  PSA: {
    '10': 3.5,
    '9.5': 2.8,
    '9': 2.0,
    '8': 1.4,
    Authentic: 1.2,
  },
  CGC: {
    '10': 3.0,
    '9.5': 2.5,
    '9': 1.8,
    '8': 1.3,
    Authentic: 1.15,
  },
  BGS: {
    '10': 3.2,
    '9.5': 2.6,
    '9': 1.9,
    '8': 1.35,
    Authentic: 1.15,
  },
};

export function getGradedPriceMultiplier(
  gradeType: GradeType,
  gradeValue?: number | string,
): number {
  if (gradeType === 'Raw' || gradeValue === undefined || gradeValue === 'Raw') {
    return 1;
  }

  const gradeKey = String(gradeValue);
  const companyMultipliers = GRADE_MULTIPLIERS[gradeType];
  return companyMultipliers[gradeKey] ?? 1.25;
}

export function calculateHoldingMarketValue(
  holding: CollectionItem,
  rawMarketPrice: number,
): number {
  const multiplier = getGradedPriceMultiplier(holding.gradeType, holding.gradeValue);
  return rawMarketPrice * multiplier * holding.quantity;
}

export function calculatePortfolioValue(
  collectionItems: CollectionItem[],
  marketPrices: Record<string, number>,
): number {
  return collectionItems.reduce((totalValue, holding) => {
    const rawMarketPrice = marketPrices[holding.cardId] || 0;
    return totalValue + calculateHoldingMarketValue(holding, rawMarketPrice);
  }, 0);
}
