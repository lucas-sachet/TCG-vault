import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { getServerEnv } from '@/lib/env';

const analyzeSchema = z.object({
  prompt: z.string().min(10).max(4000),
  context: z.string().max(8000).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = analyzeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { GEMINI_API_KEY } = getServerEnv();
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API is not configured on the server.' },
      { status: 503 },
    );
  }

  try {
    const genAi = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await genAi.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${parsed.data.context ? `${parsed.data.context}\n\n` : ''}${parsed.data.prompt}`,
            },
          ],
        },
      ],
    });

    const text = response.text ?? 'No analysis returned.';
    return NextResponse.json({ analysis: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Trainer Lab analysis failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
