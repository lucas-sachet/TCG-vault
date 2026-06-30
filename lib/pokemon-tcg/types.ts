export interface TcgApiCard {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  number: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
    printedTotal?: number;
    total?: number;
  };
  tcgplayer?: {
    prices?: {
      normal?: { market?: number; mid?: number };
      holofoil?: { market?: number; mid?: number };
      reverseHolofoil?: { market?: number; mid?: number };
      '1stEditionHolofoil'?: { market?: number; mid?: number };
    };
  };
}

export function extractMarketPriceFromTcgCard(item: TcgApiCard): number {
  return (
    item.tcgplayer?.prices?.holofoil?.market
    || item.tcgplayer?.prices?.reverseHolofoil?.market
    || item.tcgplayer?.prices?.normal?.market
    || item.tcgplayer?.prices?.normal?.mid
    || item.tcgplayer?.prices?.holofoil?.mid
    || 0
  );
}
