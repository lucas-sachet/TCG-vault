/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sliders } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex justify-between items-center bg-[#1A1D24] p-4 md:p-5 border border-slate-800 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 text-[#3B4CCA] rounded-xl shrink-0">
          <Sliders className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider font-mono">
            ACCOUNT SETTINGS & PREFERENCES
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
            Manage secure authentication profiles, display configurations, CSV ledger exports, and data integrity parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
