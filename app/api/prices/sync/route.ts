import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerEnv } from '@/lib/env';
import { fetchMarketPricesFromApi } from '@/lib/pokemon-tcg/client';

const syncSchema = z.object({
  cardIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = syncSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { POKEMON_TCG_API_KEY } = getServerEnv();
    const prices = await fetchMarketPricesFromApi(parsed.data.cardIds, POKEMON_TCG_API_KEY);
    return NextResponse.json({ prices, syncedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Price sync failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
