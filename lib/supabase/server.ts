import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';
import { cookies } from 'next/headers';
import { getPublicEnv } from '@/lib/env';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();

  return createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can be called from Server Components where cookies are read-only.
          }
        },
      },
    },
  );
}
