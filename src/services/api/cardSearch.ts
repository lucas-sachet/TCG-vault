import { Card } from '@/src/types';

interface CardSearchResponse {
  cards: Card[];
  prices: Record<string, number>;
}

export async function searchCardsFromApi(filters: {
  name?: string;
  set?: string;
  number?: string;
}): Promise<CardSearchResponse> {
  const searchParams = new URLSearchParams();
  if (filters.name) searchParams.set('name', filters.name);
  if (filters.set) searchParams.set('set', filters.set);
  if (filters.number) searchParams.set('number', filters.number);

  const response = await fetch(`/api/cards/search?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Card search failed with status ${response.status}`);
  }

  return response.json() as Promise<CardSearchResponse>;
}
