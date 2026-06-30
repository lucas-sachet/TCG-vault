/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { BookOpen, Plus } from 'lucide-react';

interface BinderEmptyStateProps {
  onCreateBinder: () => void;
  onOpenAddModal: () => void;
}

export function BinderEmptyState({ onCreateBinder, onOpenAddModal }: BinderEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-850">
        <BookOpen className="w-12 h-12 text-[#FFCB05]" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-white">Create your first binder</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Organize your Pokémon cards in virtual 9-pocket pages — just like a real binder.
          Add cards, then drag them into pockets.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCreateBinder}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFCB05] text-slate-950 font-black text-sm uppercase tracking-wide"
        >
          <Plus className="w-4 h-4" />
          New Binder
        </button>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-900"
        >
          Add a card first
        </button>
      </div>
    </div>
  );
}
