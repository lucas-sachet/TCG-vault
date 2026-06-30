/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trash2 } from 'lucide-react';

interface SettingsAccountDangerZoneProps {
  onDeleteAccount: () => void;
}

export function SettingsAccountDangerZone({ onDeleteAccount }: SettingsAccountDangerZoneProps) {
  return (
    <div className="bg-[#1A1D24] p-5 border border-red-500/20 rounded-2xl lg:col-span-2 space-y-4">
      <div className="flex justify-between items-center pb-2.5 border-b border-red-900/30">
        <h3 className="font-extrabold text-red-500 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500 animate-bounce" />
          <span>DEGRADATION CONTROL ZONE</span>
        </h3>
        <span className="text-[9px] bg-red-950/20 border border-red-900/40 text-red-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
          SAFETY OVERRIDE
        </span>
      </div>

      <div className="flex items-start justify-between gap-5 flex-col md:flex-row">
        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-xl">
          Permanently deletes your secure PokéVault profile session from our database matrices. All physical holdings cards copies, custom folders, language tracking priorities, and wish listings entries will be purged. This action is terminal and cannot be retrieved.
        </p>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="bg-red-950/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-900 hover:border-red-500 px-5 py-3.5 rounded-xl font-bold font-mono tracking-wide text-xs transition-all uppercase cursor-pointer shrink-0 w-full md:w-auto text-center"
        >
          Delete PokéVault Account
        </button>
      </div>
    </div>
  );
}
