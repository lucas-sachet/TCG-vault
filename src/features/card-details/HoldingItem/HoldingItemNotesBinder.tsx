import React from 'react';
import type { CollectionItem, Binder } from '../../../types';
import { findDefaultBinder } from '../../../constants/defaultBinder';

interface HoldingItemNotesBinderProps {
  holding: CollectionItem;
  binders: Binder[];
  isEditingNotes: boolean;
  notesText: string;
  onUpdateBinder: (id: string, binderId: string) => void;
  onStartEditingNotes: () => void;
  onNotesTextChange: (text: string) => void;
  onCancelNotes: () => void;
  onSaveNotes: () => void;
}

export const HoldingItemNotesBinder: React.FC<HoldingItemNotesBinderProps> = ({
  holding,
  binders,
  isEditingNotes,
  notesText,
  onUpdateBinder,
  onStartEditingNotes,
  onNotesTextChange,
  onCancelNotes,
  onSaveNotes
}) => {
  const defaultBinder = findDefaultBinder(binders);
  const selectedBinderId = holding.binderId || defaultBinder?.id || '';

  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
    <div className="space-y-1">
      <label className="text-[9px] text-slate-500 font-mono uppercase block">SHELF BINDER</label>
      <select
        value={selectedBinderId}
        onChange={(event) => onUpdateBinder(holding.id, event.target.value)}
        className="w-full bg-slate-900 text-[11px] text-slate-200 py-1.5 px-3 rounded-lg border border-slate-850 focus:outline-none"
      >
        {defaultBinder && (
          <option value={defaultBinder.id}>{defaultBinder.name} (Default)</option>
        )}
        {binders.filter((binder) => !binder.isDefault).map((binder) => (
          <option key={binder.id} value={binder.id}>{binder.name}</option>
        ))}
      </select>
    </div>

    <div className="space-y-1 relative">
      <label className="text-[9px] text-slate-500 font-mono uppercase block">PRIVATE NOTES</label>
      {isEditingNotes ? (
        <div className="space-y-1">
          <textarea
            value={notesText}
            onChange={(e) => onNotesTextChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 rounded-lg p-1.5 text-[11px] text-slate-100 placeholder-slate-550 focus:outline-none min-h-[45px]"
          />
          <div className="flex justify-end gap-1">
            <button
              onClick={onCancelNotes}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded text-[9px]"
            >
              Cancel
            </button>
            <button
              onClick={onSaveNotes}
              className="bg-green-500 hover:bg-green-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[9px]"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={onStartEditingNotes}
          className="p-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-850/60 cursor-pointer min-h-[32px] flex items-center justify-between"
        >
          <p className="text-[11px] text-slate-300 italic truncate max-w-[170px]">
            {holding.notes || 'Click to log notes...'}
          </p>
          <span className="text-[9px] text-[#FFCB05] font-bold">Edit &rarr;</span>
        </div>
      )}
    </div>
  </div>
  );
};
