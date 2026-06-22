/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card } from '../types';

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

import { services } from './serviceProvider';

export async function searchPokemonCards(filters: {
  name?: string;
  set?: string;
  number?: string;
}): Promise<Card[]> {
  const queryParts: string[] = [];
  
  if (filters.name?.trim()) {
    const cleanName = filters.name.trim().replace(/["']/g, '');
    queryParts.push(`name:"*${cleanName}*"`);
  }
  
  if (filters.set?.trim()) {
    const cleanSet = filters.set.trim().replace(/["']/g, '');
    queryParts.push(`set.name:"*${cleanSet}*"`);
  }
  
  if (filters.number?.trim()) {
    const cleanNumber = filters.number.trim().replace(/["']/g, '');
    queryParts.push(`number:"${cleanNumber}"`);
  }
  
  if (queryParts.length === 0) {
    return [];
  }
  
  const q = queryParts.join(' AND ');
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&pageSize=50`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Pokemon TCG API responded with status ${response.status}`);
    }
    
    const json = await response.json();
    const data: TcgApiCard[] = json.data || [];
    
    const results = data.map((item): Card => {
      const numPercent = item.set?.printedTotal ? `/${item.set.printedTotal}` : '';
      return {
        id: item.id,
        name: item.name,
        set: item.set?.name || 'Unknown Set',
        number: `${item.number}${numPercent}`,
        rarity: item.rarity || 'Uncommon',
        language: 'EN', // Default
        imageUrl: item.images?.large || item.images?.small || 'https://images.pokemontcg.io/sv3/223_hires.png',
        supertype: item.supertype,
        subtypes: item.subtypes
      };
    });

    const pricesToSave: Record<string, number> = {};
    data.forEach((item) => {
      const priceVal = item.tcgplayer?.prices?.normal?.market 
        || item.tcgplayer?.prices?.holofoil?.market
        || item.tcgplayer?.prices?.reverseHolofoil?.market
        || item.tcgplayer?.prices?.normal?.mid
        || item.tcgplayer?.prices?.holofoil?.mid
        || 0;
      
      if (priceVal > 0) {
        pricesToSave[item.id] = priceVal;
      }
    });

    if (Object.keys(pricesToSave).length > 0) {
      const currentPrices = services.prices.getMarketPrices();
      const updatedPrices = { ...currentPrices, ...pricesToSave };
      services.prices.saveMarketPrices(updatedPrices);
    }

    return results;
  } catch (error) {
    console.error('Error searching Pokemon TCG API:', error);
    throw error;
  }
}

