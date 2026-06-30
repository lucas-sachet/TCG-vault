/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Binder } from '@/src/types';

export const DEFAULT_BINDER_NAME = 'Main Collection';
export const DEFAULT_BINDER_DESCRIPTION =
  'Default binder for cards that are not assigned to a custom binder.';

export function buildDefaultBinderId(userId: string): string {
  return `binder-default-${userId}`;
}

export function isDefaultBinderId(binderId: string, userId: string): boolean {
  return binderId === buildDefaultBinderId(userId);
}

export function findDefaultBinder(binders: Binder[]): Binder | undefined {
  return binders.find((binder) => binder.isDefault) ?? binders[0];
}

export function resolveBinderId(
  binderId: string | undefined,
  binders: Binder[],
): string | undefined {
  if (binderId && binderId !== 'binder-all') {
    return binderId;
  }
  return findDefaultBinder(binders)?.id;
}
