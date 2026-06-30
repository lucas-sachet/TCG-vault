/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { Eye, RefreshCw, XCircle } from 'lucide-react';

interface BinderPocketActionSheetProps {
  isOpen: boolean;
  cardName: string;
  onClose: () => void;
  onViewHolding: () => void;
  onRemoveFromPocket: () => void;
  onPlaceDifferent: () => void;
}

export function BinderPocketActionSheet({
  isOpen,
  cardName,
  onClose,
  onViewHolding,
  onRemoveFromPocket,
  onPlaceDifferent,
}: BinderPocketActionSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-2xl border border-slate-800 bg-[#171A21] p-4 shadow-2xl sm:rounded-2xl">
        <p className="mb-3 truncate text-xs font-bold text-white">{cardName}</p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onViewHolding();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-slate-200 transition hover:bg-slate-800"
          >
            <Eye className="h-4 w-4 text-indigo-400" />
            View Holding
          </button>
          <button
            type="button"
            onClick={() => {
              onPlaceDifferent();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-slate-200 transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4 text-[#FFCB05]" />
            Place Different Holding
          </button>
          <button
            type="button"
            onClick={() => {
              onRemoveFromPocket();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-red-400 transition hover:bg-red-950/30"
          >
            <XCircle className="h-4 w-4" />
            Remove from Pocket
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-slate-800 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
