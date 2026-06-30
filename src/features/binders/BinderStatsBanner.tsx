/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { isMvpFeatureEnabled } from '../../config/mvpFeatures';
import type { PageFillStats } from './binderStats';

interface BinderStatsBannerProps {
  pageFillStats: PageFillStats;
  binderSlottedCount: number;
  binderTotalValue: number;
  currencySymbol: string;
}

export function BinderStatsBanner({
  pageFillStats,
  binderSlottedCount,
  binderTotalValue,
  currencySymbol,
}: BinderStatsBannerProps) {
  const showValue = isMvpFeatureEnabled('pocketPriceBadge');

  return (
    <div className="rounded-2xl border border-slate-850 bg-slate-950/80 p-4 md:p-5">
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4 md:gap-6">
        <div className="space-y-2 md:col-span-2">
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>PAGE COMPLETION</span>
            <span className="font-bold text-[#FFCB05]">
              {pageFillStats.filledCount} / {pageFillStats.totalCount} POCKETS (
              {pageFillStats.fillPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-slate-850 bg-slate-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
              style={{ width: `${pageFillStats.fillPercentage}%` }}
            />
          </div>
        </div>

        <div className="hidden h-10 w-px bg-slate-850 md:block" />

        <div className="grid grid-cols-2 gap-4 text-center font-mono md:col-span-2 md:text-left">
          <div>
            <span className="block text-[8px] text-slate-500">SLOTTED HOLDINGS</span>
            <span className="mt-1 block text-sm font-extrabold text-white">{binderSlottedCount}</span>
          </div>
          {showValue && (
            <div>
              <span className="block text-[8px] text-slate-500">BINDER VALUE</span>
              <span className="mt-1 block text-sm font-extrabold text-white">
                {currencySymbol}{binderTotalValue.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
