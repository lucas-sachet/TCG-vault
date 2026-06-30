import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';
import { getPublicEnv } from '@/lib/env';

export function createSupabaseBrowserClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();

  return createBrowserClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
