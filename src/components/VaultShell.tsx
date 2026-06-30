/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { syncFromSupabase, clearSupabaseCache } from '@/lib/supabase';
import { deleteUserAccount } from '@/lib/actions/account';
import { hydrateVaultCache } from '@/src/hooks/hydrateVaultCache';
import { VaultApp } from '@/src/components/VaultApp';

export function VaultShell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session?.user) {
        router.replace('/?auth=required');
        return;
      }
      setUserEmail(session.user.email ?? null);
      setUserId(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        router.replace('/?auth=required');
        return;
      }
      setUserEmail(session.user.email ?? null);
      setUserId(session.user.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  useEffect(() => {
    if (userEmail && userId) {
      setIsDataLoaded(false);
      syncFromSupabase(userId, userEmail).then(() => {
        hydrateVaultCache(queryClient);
        setIsDataLoaded(true);
      });
    } else {
      setIsDataLoaded(true);
      clearSupabaseCache(userEmail ?? undefined);
    }
  }, [userEmail, userId, queryClient]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (userId) {
      await deleteUserAccount(userId);
    }
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!userEmail || !isDataLoaded) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-t-indigo-500 border-indigo-900/30 rounded-full animate-spin" />
        <div className="text-sm font-mono text-slate-400">Securely decrypting vault profile...</div>
      </div>
    );
  }

  return (
    <VaultApp
      userEmail={userEmail}
      handleSignOut={handleSignOut}
      handleDeleteAccount={handleDeleteAccount}
    />
  );
}
