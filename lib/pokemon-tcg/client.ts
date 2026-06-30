import { extractMarketPriceFromTcgCard, type TcgApiCard } from '@/lib/pokemon-tcg/types';

export { extractMarketPriceFromTcgCard };
export type { TcgApiCard };

export async function searchPokemonCardsFromApi(
  filters: { name?: string; set?: string; number?: string },
  apiKey?: string,
) {
  const queryParts: string[] = [];

  if (filters.name?.trim()) {
    queryParts.push(`name:"*${filters.name.trim().replace(/["']/g, '')}*"`);
  }
  if (filters.set?.trim()) {
    queryParts.push(`set.name:"*${filters.set.trim().replace(/["']/g, '')}*"`);
  }
  if (filters.number?.trim()) {
    queryParts.push(`number:"${filters.number.trim().replace(/["']/g, '')}"`);
  }

  if (queryParts.length === 0) {
    return { cards: [], prices: {} as Record<string, number> };
  }

  const query = queryParts.join(' AND ');
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=50`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Pokemon TCG API responded with status ${response.status}`);
  }

  const json = await response.json();
  const data: TcgApiCard[] = json.data || [];
  const prices: Record<string, number> = {};

  const cards = data.map((item) => {
    const priceValue = extractMarketPriceFromTcgCard(item);
    if (priceValue > 0) {
      prices[item.id] = priceValue;
    }

    const printedTotalSuffix = item.set?.printedTotal ? `/${item.set.printedTotal}` : '';

    return {
      id: item.id,
      name: item.name,
      set: item.set?.name || 'Unknown Set',
      number: `${item.number}${printedTotalSuffix}`,
      rarity: item.rarity || 'Uncommon',
      language: 'EN' as const,
      imageUrl: item.images?.large || item.images?.small || '',
      supertype: item.supertype,
      subtypes: item.subtypes,
    };
  });

  return { cards, prices };
}

export async function fetchMarketPricesFromApi(
  cardIds: string[],
  apiKey?: string,
): Promise<Record<string, number>> {
  const uniqueCardIds = [...new Set(cardIds.filter(Boolean))];
  const marketPrices: Record<string, number> = {};
  const batchSize = 20;

  for (let batchStart = 0; batchStart < uniqueCardIds.length; batchStart += batchSize) {
    const cardIdBatch = uniqueCardIds.slice(batchStart, batchStart + batchSize);
    const query = cardIdBatch.map((cardId) => `id:${cardId}`).join(' OR ');
    const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=${batchSize}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`Pokemon TCG API responded with status ${response.status}`);
    }

    const json = await response.json();
    const data: TcgApiCard[] = json.data || [];

    data.forEach((item) => {
      const priceValue = extractMarketPriceFromTcgCard(item);
      if (priceValue > 0) {
        marketPrices[item.id] = priceValue;
      }
    });
  }

  return marketPrices;
}
