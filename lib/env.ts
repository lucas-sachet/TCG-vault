import { z } from 'zod';

const serverEnvSchema = z.object({
  POKEMON_TCG_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  APP_URL: z.string().url().optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export function getPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    POKEMON_TCG_API_KEY: process.env.POKEMON_TCG_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    APP_URL: process.env.APP_URL,
  });
}
