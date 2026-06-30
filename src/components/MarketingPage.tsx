/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { LandingPage } from '@/src/components/LandingPage';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function MarketingPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [shouldShowAuthModal, setShouldShowAuthModal] = useState(
    searchParams.get('auth') === 'required',
  );

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const navigate = useCallback((to: string) => {
    router.push(to);
  }, [router]);

  const handleAuthSuccess = useCallback(async (_email: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return;
    }

    setUserEmail(session.user.email);
    router.push('/app');
  }, [router, supabase.auth]);

  return (
    <LandingPage
      onAuthSuccess={handleAuthSuccess}
      currentPath={pathname}
      navigate={navigate}
      initialShowAuthModal={shouldShowAuthModal}
      clearInitialShowAuthModal={() => setShouldShowAuthModal(false)}
      userEmail={userEmail}
    />
  );
}
