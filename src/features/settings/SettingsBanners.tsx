/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface SettingsBannersProps {
  successBanner: string | null;
  errorBanner: string | null;
  onDismissSuccess: () => void;
  onDismissError: () => void;
}

export function SettingsBanners({
  successBanner,
  errorBanner,
  onDismissSuccess,
  onDismissError,
}: SettingsBannersProps) {
  return (
    <>
      {successBanner && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between animate-feed-in font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={onDismissSuccess} className="text-emerald-500 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-500 text-xs flex items-center justify-between animate-feed-in font-semibold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={onDismissError} className="text-red-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
