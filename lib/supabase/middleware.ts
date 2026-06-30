import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';
import { NextResponse, type NextRequest } from 'next/server';
import { getPublicEnv } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getPublicEnv();

  const supabase = createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    redirectUrl.searchParams.set('auth', 'required');
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
