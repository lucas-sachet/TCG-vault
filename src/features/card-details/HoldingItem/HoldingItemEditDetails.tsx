import React from 'react';
import type { CollectionItem } from '../../../types';
import type { GradeType } from '../cardDetailsTypes';

interface HoldingItemEditDetailsProps {
  holding: CollectionItem;
  currencySymbol: string;
  editPrice: number;
  editDate: string;
  editGradeType: GradeType;
  editGradeValue: string | number;
  editCertNumber: string;
  onEditPriceChange: (price: number) => void;
  onEditDateChange: (date: string) => void;
  onEditGradeTypeChange: (gradeType: GradeType) => void;
  onEditGradeValueChange: (value: string) => void;
  onEditCertNumberChange: (cert: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const HoldingItemEditDetails: React.FC<HoldingItemEditDetailsProps> = ({
  holding,
  currencySymbol,
  editPrice,
  editDate,
  editGradeType,
  editGradeValue,
  editCertNumber,
  onEditPriceChange,
  onEditDateChange,
  onEditGradeTypeChange,
  onEditGradeValueChange,
  onEditCertNumberChange,
  onCancel,
  onSave
}) => (
  <div className="p-3 bg-[#111317] border border-slate-850 rounded-xl space-y-3 animate-fade-in text-xs">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Purchase Date</label>
        <input
          type="date"
          value={editDate}
          onChange={(e) => onEditDateChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-[9px] text-[#FFCB05] font-mono block uppercase mb-1 font-bold">Purchase Price ({currencySymbol})</label>
        {holding.purchasePrice === 0 ? (
          <input
            type="number"
            value={editPrice}
            onChange={(e) => onEditPriceChange(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
            min="0"
          />
        ) : (
          <div className="flex items-center justify-between bg-slate-900/50 border border-slate-850 rounded-lg p-2 text-slate-450 select-none cursor-not-allowed">
            <span className="font-mono">{currencySymbol}{holding.purchasePrice}</span>
            <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
              <span>🔒 LOCKED</span>
            </span>
          </div>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
      <div>
        <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Grade Type</label>
        <select
          value={editGradeType}
          onChange={(e) => onEditGradeTypeChange(e.target.value as GradeType)}
          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer focus:border-blue-500"
        >
          <option value="Raw">Raw (Ungraded)</option>
          <option value="PSA">PSA</option>
          <option value="CGC">CGC</option>
          <option value="BGS">BGS</option>
        </select>
      </div>
      {editGradeType !== 'Raw' && (
        <>
          <div>
            <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Grade score</label>
            <input
              type="text"
              value={editGradeValue}
              onChange={(e) => onEditGradeValueChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-450 font-mono block uppercase mb-1 font-bold">Cert Number</label>
            <input
              type="text"
              value={editCertNumber}
              onChange={(e) => onEditCertNumberChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </>
      )}
    </div>
    <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
      <button
        type="button"
        onClick={onCancel}
        className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-850 hover:bg-slate-800 transition cursor-pointer select-none"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        className="px-3.5 py-1.5 text-[10px] uppercase font-black text-slate-950 bg-[#FFCB05] hover:bg-yellow-400 rounded-lg transition cursor-pointer select-none"
      >
        Save Details
      </button>
    </div>
  </div>
);
