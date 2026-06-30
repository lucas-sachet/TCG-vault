/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { useToast } from '../components/ui/ToastProvider';

export function usePersistFeedback() {
  const { showToast } = useToast();

  const notifySaveFailure = useCallback((context: string) => {
    showToast(`Não foi possível salvar ${context}. Tente novamente.`, 'error');
  }, [showToast]);

  return { notifySaveFailure };
}
