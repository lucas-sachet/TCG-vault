/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function addDays(dateStr: string, days: number, maxDateStr: string = '2026-06-15'): string {
  try {
    const dateValue = new Date(dateStr + 'T12:00:00');
    dateValue.setDate(dateValue.getDate() + days);
    const resultStr = dateValue.toISOString().split('T')[0];
    if (resultStr > maxDateStr) return maxDateStr;
    return resultStr;
  } catch {
    return dateStr;
  }
}

export const PRESET_AVATAR_LABELS: Record<string, string> = {
  'avatar-oak': '👴',
  'avatar-ash': '🧢',
  'avatar-misty': '💧',
  'avatar-pikachu': '⚡',
};
