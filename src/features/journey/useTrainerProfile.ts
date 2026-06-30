/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useMemo } from 'react';
import { PRESET_AVATAR_LABELS } from './journey-utils';

export function useTrainerProfile(userEmail: string) {
  const activeEmail = userEmail || (typeof localStorage !== 'undefined' ? localStorage.getItem('pokevault_currentUser') || '' : '');

  const trainerName = useMemo(() => {
    if (activeEmail) {
      const storedDisplay = localStorage.getItem(`pokevault_displayName_${activeEmail}`);
      const storedNick = localStorage.getItem(`pokevault_nickname_${activeEmail}`);
      return (storedNick?.trim() || storedDisplay?.trim() || 'Trainer Ash');
    }
    return 'Trainer Ash';
  }, [activeEmail]);

  const trainerAvatar = useMemo(() => {
    if (activeEmail) {
      const storedPic = localStorage.getItem(`pokevault_profilePic_${activeEmail}`);
      if (storedPic) {
        if (storedPic.startsWith('data:')) return storedPic;
        return PRESET_AVATAR_LABELS[storedPic] || '👴';
      }
    }
    return '👴';
  }, [activeEmail]);

  return { trainerName, trainerAvatar };
}
