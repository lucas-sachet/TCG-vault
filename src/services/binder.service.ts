/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Binder } from '../types';
import { INITIAL_BINDERS } from '../data/pokemonData';
import { IBinderService } from './interfaces';

export class LocalStorageBinderService implements IBinderService {
  getBinders(): Binder[] {
    const saved = localStorage.getItem('tcgvault_binders') || localStorage.getItem('pokevault_binders');
    if (saved) return JSON.parse(saved);
    return INITIAL_BINDERS;
  }

  saveBinders(binders: Binder[]): void {
    localStorage.setItem('tcgvault_binders', JSON.stringify(binders));
  }
}

export const binderService = new LocalStorageBinderService();
