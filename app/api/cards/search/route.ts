import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerEnv } from '@/lib/env';
import { searchPokemonCardsFromApi } from '@/lib/pokemon-tcg/client';

const searchSchema = z.object({
  name: z.string().optional(),
  set: z.string().optional(),
  number: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    name: searchParams.get('name') ?? undefined,
    set: searchParams.get('set') ?? undefined,
    number: searchParams.get('number') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { POKEMON_TCG_API_KEY } = getServerEnv();
    const result = await searchPokemonCardsFromApi(parsed.data, POKEMON_TCG_API_KEY);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Card search failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
