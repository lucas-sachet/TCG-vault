/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download } from 'lucide-react';
import type { CollectionItem } from '../../types';

interface SettingsAccountExportPanelProps {
  collectionItems: CollectionItem[];
  onExportCollectionCSV: () => void;
  onExportWishlistCSV: () => void;
  onExportFullDataJson: () => void;
}

export function SettingsAccountExportPanel({
  collectionItems,
  onExportCollectionCSV,
  onExportWishlistCSV,
  onExportFullDataJson,
}: SettingsAccountExportPanelProps) {
  return (
    <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl lg:col-span-2 space-y-4">
      <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
        <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Export Vault Storage Matrices</span>
        </h3>
        <span className="text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
          Standard CSV
        </span>
      </div>

      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
        Generate offline backups of physical slabs ledger structures. Exports match exact card metadata, purchase basis, qualities, and certificate notes. No remote server tracks these entries.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-[#12151D] border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3.5">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Personal Holdings Backup</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">
              Packages all <span className="text-[#FFCB05] font-bold">{collectionItems.length} portfolio item cards</span> with certificate codes intact.
            </span>
          </div>
          <button
            type="button"
            onClick={onExportCollectionCSV}
            className="w-full py-3 bg-slate-900 hover:bg-[#3B4CCA] text-slate-300 hover:text-white border border-slate-850 transition-all font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Collections ledger (.CSV)</span>
          </button>
        </div>

        <div className="bg-[#12151D] border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3.5">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Collector Wishlist Backup</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">
              Secures active buyer price triggers, prioritized desires, and card reference notes for offline planning.
            </span>
          </div>
          <button
            type="button"
            onClick={onExportWishlistCSV}
            className="w-full py-3 bg-slate-900 hover:bg-[#3B4CCA] text-slate-300 hover:text-white border border-slate-850 transition-all font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Wishlists Ledger (.CSV)</span>
          </button>
        </div>

        <div className="bg-[#12151D] border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3.5 sm:col-span-2">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Full LGPD Data Package</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">
              Exports profile, binders, goals, price history, notifications, and alerts as JSON.
            </span>
          </div>
          <button
            type="button"
            onClick={onExportFullDataJson}
            className="w-full py-3 bg-slate-900 hover:bg-emerald-700 text-slate-300 hover:text-white border border-slate-850 transition-all font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Account Data (.JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
