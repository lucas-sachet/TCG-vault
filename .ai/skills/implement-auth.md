# Implement Authentication — Supabase Auth & Middleware Guarding

## Purpose

Guides the setup, integration, and protection of routes using Supabase Authentication. Details workflows for email-password login, Google OAuth SSO, server-side middleware protection, session validation, and onboarding synchronization.

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Provider Type | ✅ | Email/Password, Google OAuth, or guest credentials |
| Target Routes | ✅ | Protected routes (e.g. `/app/*`) vs Public routes (`/about`, `/privacy`, `/`) |

---

## Outputs

1. **Next.js Middleware Gate**: Authentication guard block in `middleware.ts`.
2. **Auth API Client wrapper**: Services for SignUp, Login, Logout, and Forgot Password.
3. **Protected Layout Provider**: Next.js App Router context ensuring session validity.

---

## Workflow

### Step 1 — Configure Next.js Middleware Gate
Protect routes server-side. Do not rely on client-side React code to hide elements.

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect users attempting to access dashboard (/app/*) without a session
  if (req.nextUrl.pathname.startsWith('/app') && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users trying to access login/register back to dashboard
  if (req.nextUrl.pathname.startsWith('/auth') && session) {
    return NextResponse.redirect(new URL('/app/collection', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
};
```

### Step 2 — Construct Authenticated Service Layer
Create clean service interfaces to handle authentication:

```typescript
// src/services/auth.service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### Step 3 — Sync Onboarding State & Profile Creation
Use a PostgreSQL trigger in Supabase database to automatically insert a user profile record in the `profiles` table when a new row is created in `auth.users`.

```sql
-- SQL Migration: Trigger for User Signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, email, onboarded, settings)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    false,
    '{"currency":"USD", "languages":["EN"]}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Validation Steps

1. Verify that unauthorized requests directly to `/app/collection` trigger a redirection status (302) to `/auth/login`.
2. Confirm that sign-ups trigger correct database inserts inside the `profiles` table via the SQL database trigger.
3. Test Google OAuth flow using a sandbox email address.

---

## Quality Gates

- [ ] All page routes starting with `/app` are locked behind Next.js Edge Middleware checks.
- [ ] Direct passwords never print in server logs or browser debug consoles.
- [ ] Onboarding state redirects users who have not completed the Onboarding Wizard to `/app/onboarding` first.
- [ ] No hardcoded authentication credentials exist in source files.
- [ ] Logout deletes cookies and clears cache.
