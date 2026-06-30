/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface BinderFormValues {
  name: string;
  description: string;
}

interface BinderFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues?: BinderFormValues;
  onClose: () => void;
  onSubmit: (values: BinderFormValues) => void;
}

export function BinderFormModal({
  isOpen,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: BinderFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name ?? '');
      setDescription(initialValues?.description ?? '');
    }
  }, [isOpen, initialValues?.name, initialValues?.description]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    onSubmit({
      name: trimmedName,
      description: description.trim(),
    });
    onClose();
  }

  const title = mode === 'create' ? 'New Binder' : 'Edit Binder';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#171A21] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-white">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="binder-name" className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Name
            </label>
            <input
              id="binder-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Binder"
              required
              autoFocus
              className="w-full rounded-xl border border-slate-800 bg-[#1A1D24] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="binder-description" className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Description (optional)
            </label>
            <textarea
              id="binder-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Vintage holos, trade fodder..."
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-800 bg-[#1A1D24] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white transition hover:from-indigo-500 hover:to-violet-600 disabled:opacity-40"
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
