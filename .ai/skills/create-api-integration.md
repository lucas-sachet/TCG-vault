# Create API Integration — External & Internal Services

## Purpose

Guides the creation and extension of API integrations within PokéVault, specifically the official Pokémon TCG API, the Gemini AI (@google/genai) integration, and internal Supabase service modules. This skill ensures all integrations use strict TypeScript contracts, proper caching (in-memory, localStorage, and Edge caching), rate limiters, backoff retries, and comprehensive error handling instead of raw client fetches.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| API Target | ✅ | Endpoint Base URL (e.g., `https://api.pokemontcg.io/v2` or Google Gemini) |
| Integration Type | ✅ | `external-client` (direct from server), `internal-api` (Next.js route), `client-relay` |
| Request/Response Contracts | ✅ | Expected JSON structure, filters, query params, headers, and schemas |
| Authentication Type | ✅ | API Key, OAuth, Bearer token, or Unauthenticated |
| Caching Policy | ✅ | Stale time, cache invalidation key, persistence layer (in-memory/storage) |
| Rate-limit Constraints | ✅ | Max requests per second/day, concurrent request limits |

---

## Outputs

### External API Integration Client
```
src/services/api/
├── [apiName].service.ts    # Service wrapper with base configurations
└── types.ts                # TypeScript interfaces for request/response payloads
```

### Next.js Server-Side Relay (if key needs protection)
```
src/app/api/[apiName]/
└── route.ts                # Server Route Handler for securing API credentials
```

---

## Workflow

### Step 1 — Define Payload Interfaces
Create explicit TypeScript types matching the external API schema. NEVER use `any` to type responses. 

```typescript
// src/services/api/pokemonTcg.types.ts
export interface TcgApiCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  types?: string[];
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    prices?: {
      holofoil?: { market: number; mid?: number };
      normal?: { market: number; mid?: number };
    };
  };
}

export interface TcgSearchResponse {
  data: TcgApiCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}
```

### Step 2 — Construct the Service Client with Rate Limiting & Backoff
Implement retries, rate limits, and custom mapping to clean internal types.

```typescript
// src/services/api/pokemonTcg.service.ts
import { TcgSearchResponse, TcgApiCard } from './pokemonTcg.types';
import { Card } from '@/types';

const BASE_URL = 'https://api.pokemontcg.io/v2';

export class PokemonTcgService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.POKEMON_TCG_API_KEY;
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    const headers = new Headers(options.headers);
    if (this.apiKey) {
      headers.set('X-Api-Key', this.apiKey);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 429 && retries > 0) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1);
      }

      if (!response.ok) {
        throw new Error(`API Request failed with status ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retries > 0) {
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  public async searchCards(query: string, page = 1, pageSize = 50): Promise<Card[]> {
    const url = `${BASE_URL}/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;
    const response = await this.fetchWithRetry(url, {
      next: { revalidate: 3600 } // Next.js ISR cache for 1 hour
    });
    const result: TcgSearchResponse = await response.json();
    return result.data.map(this.mapToInternalCard);
  }

  private mapToInternalCard(card: TcgApiCard): Card {
    const marketPrice = 
      card.tcgplayer?.prices?.holofoil?.market ?? 
      card.tcgplayer?.prices?.normal?.market ?? 
      card.tcgplayer?.prices?.holofoil?.mid ?? 
      card.tcgplayer?.prices?.normal?.mid ?? 0;

    return {
      id: card.id,
      name: card.name,
      supertype: card.supertype,
      subtypes: card.subtypes,
      imageUrl: card.images.large ?? card.images.small,
      marketPrice,
      language: 'EN', // Default from official API
      number: card.id.split('-')[1] ?? '0',
      rarity: 'Unknown'
    };
  }
}
```

### Step 3 — Secure Sensitive API Keys via Next.js Route Handlers
For client-side actions (e.g. Gemini AI prompts inside the Trainer Lab), route all calls through Next.js server route handlers to hide API keys.

```typescript
// src/app/api/trainer-lab/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { cardName, cardImage } = await req.json();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        `You are a professional Pokemon TCG grader and deckbuilder. Analyze this card: ${cardName}.`,
        cardImage ? { inlineData: { data: cardImage, mimeType: 'image/jpeg' } } : ''
      ].filter(Boolean),
    });

    return NextResponse.json({ analysis: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'AI analysis failed' }, { status: 500 });
  }
}
```

---

## Validation Steps

1. **Verify Token Storage**: Ensure no API keys or credentials are stored client-side in components or `.env.local` exposed to browsers.
2. **Rate Limit & Retry Testing**: Simulate API failure (`status === 429`) in dev and check if backing off works correctly.
3. **Data Type Compliance**: Ensure compiler runs with `strict: true` and no fields are bypassed via `as any`.
4. **Offline support check**: Verify that fallback structures (e.g., cached images via Service Worker) return offline indicators when internet fails.

---

## Quality Gates

- [ ] Zero client-side API requests using raw `fetch` for third-party keys.
- [ ] Response payloads mapped from raw format to clean target formats defined in `src/types.ts`.
- [ ] Cache-control headers or Next.js `revalidate` flags set appropriately.
- [ ] Type-safety strictly enforced: No `any` annotations used.
- [ ] Errors caught and translated into user-friendly error banners or toast calls instead of silent fail.
