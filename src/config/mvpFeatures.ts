/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Toggle prototype features off for MVP. Code remains mounted behind flags.
 */

export const mvpFeatures = {
  binders: true,
  settings: true,
  addCard: true,
  dashboard: false,
  journey: false,
  wishlist: false,
  trainerLab: false,
  analytics: false,
  onboarding: false,
  priceChart: false,
  priceAlerts: false,
  journeyPanel: false,
  activityLog: false,
  portfolioMetrics: false,
  settingsExport: false,
  pocketPriceBadge: true,
} as const;

export type MvpFeatureKey = keyof typeof mvpFeatures;

export function isMvpFeatureEnabled(feature: MvpFeatureKey): boolean {
  return mvpFeatures[feature];
}
