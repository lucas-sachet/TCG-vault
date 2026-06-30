/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, ImageIcon, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import type { Binder, BinderSlot, Card } from '../../types';
import { getBinderSlottedCount } from './binderStats';
import { BinderFormModal, type BinderFormValues } from './BinderFormModal';

interface BinderListPanelProps {
  binders: Binder[];
  binderSlots: BinderSlot[];
  cards: Card[];
  selectedBinderId: string | null;
  defaultBinderName?: string;
  onSelectBinder: (binderId: string) => void;
  onAddBinder: (name: string, description?: string) => string;
  onUpdateBinder: (
    binderId: string,
    updates: { name?: string; description?: string; coverCardId?: string | null },
  ) => void;
  onDeleteBinder: (binderId: string) => void;
  onOpenCoverPicker: (binderId: string) => void;
}

export function BinderListPanel({
  binders,
  binderSlots,
  cards,
  selectedBinderId,
  defaultBinderName = 'Main Collection',
  onSelectBinder,
  onAddBinder,
  onUpdateBinder,
  onDeleteBinder,
  onOpenCoverPicker,
}: BinderListPanelProps) {
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingBinder, setEditingBinder] = useState<Binder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Binder | null>(null);
  const [menuOpenBinderId, setMenuOpenBinderId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenBinderId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function resolveCoverImageUrl(binder: Binder): string | null {
    if (!binder.coverCardId) {
      return null;
    }
    const card = cards.find((entry) => entry.id === binder.coverCardId);
    if (!card?.imageUrl) {
      return null;
    }
    return getOptimizedImageUrl(card.imageUrl, 80);
  }

  function handleFormSubmit(values: BinderFormValues) {
    if (formMode === 'create') {
      const newBinderId = onAddBinder(values.name, values.description || undefined);
      onSelectBinder(newBinderId);
      return;
    }
    if (formMode === 'edit' && editingBinder) {
      onUpdateBinder(editingBinder.id, {
        name: values.name,
        description: values.description || undefined,
      });
    }
  }

  function openEditModal(binder: Binder) {
    setEditingBinder(binder);
    setFormMode('edit');
    setMenuOpenBinderId(null);
  }

  return (
    <>
      <aside className="w-full shrink-0 space-y-3 lg:w-64">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
            My Binders
          </span>
          <button
            type="button"
            onClick={() => {
              setEditingBinder(null);
              setFormMode('create');
            }}
            className="rounded-lg bg-slate-800 p-1.5 text-[#FFCB05] transition hover:bg-slate-700"
            aria-label="Create binder"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {binders.map((binder) => {
            const isSelected = binder.id === selectedBinderId;
            const coverImageUrl = resolveCoverImageUrl(binder);
            const slottedCount = getBinderSlottedCount(binder.id, binderSlots);
            const isMenuOpen = menuOpenBinderId === binder.id;

            return (
              <div key={binder.id} className="relative shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => onSelectBinder(binder.id)}
                  className={`flex min-w-[160px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition lg:w-full ${
                    isSelected
                      ? 'border-[#FFCB05]/40 bg-slate-900 text-white'
                      : 'border-slate-850 bg-[#0b0c11] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                    {coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className={`h-4 w-4 ${isSelected ? 'text-[#FFCB05]' : 'text-slate-600'}`} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{binder.name}</span>
                    <span className="block truncate text-[9px] text-slate-500">
                      {binder.description || `${slottedCount} in pockets`}
                    </span>
                  </div>
                </button>

                {isSelected && (
                  <div className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 lg:relative lg:right-auto lg:top-auto lg:mt-1 lg:translate-y-0">
                    <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                      <button
                        type="button"
                        onClick={() => setMenuOpenBinderId(isMenuOpen ? null : binder.id)}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 transition hover:text-white"
                        aria-label="Binder options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-800 bg-[#171A21] py-1 shadow-xl lg:left-0 lg:right-auto">
                          <button
                            type="button"
                            onClick={() => openEditModal(binder)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenCoverPicker(binder.id);
                              setMenuOpenBinderId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-800"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            Set Cover
                          </button>
                          {!binder.isDefault && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(binder);
                                setMenuOpenBinderId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <BinderFormModal
        isOpen={formMode !== null}
        mode={formMode === 'create' ? 'create' : 'edit'}
        initialValues={
          formMode === 'edit' && editingBinder
            ? { name: editingBinder.name, description: editingBinder.description ?? '' }
            : { name: '', description: '' }
        }
        onClose={() => {
          setFormMode(null);
          setEditingBinder(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteBinder(deleteTarget.id);
          }
        }}
        title="Delete Binder"
        description={`Delete "${deleteTarget?.name}"? Holdings will move to ${defaultBinderName} and all pockets will be cleared.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
