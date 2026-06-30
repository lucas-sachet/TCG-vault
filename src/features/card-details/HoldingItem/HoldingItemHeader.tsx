import React from 'react';
import { Trash2 } from 'lucide-react';
import type { CollectionItem } from '../../../types';
import type { ConfirmModalConfig } from '../cardDetailsTypes';

interface HoldingItemHeaderProps {
  holding: CollectionItem;
  currencySymbol: string;
  isEditingDetails: boolean;
  onStartEdit: () => void;
  onDelete: (id: string) => void;
  setConfirmModal?: (config: ConfirmModalConfig) => void;
}

export const HoldingItemHeader: React.FC<HoldingItemHeaderProps> = ({
  holding,
  currencySymbol,
  isEditingDetails,
  onStartEdit,
  onDelete,
  setConfirmModal
}) => (
  <div className="flex justify-between items-start gap-4 pb-2 border-b border-slate-850/80">
    <div>
      <span className="text-[10px] text-[#FFCB05] font-bold font-mono block uppercase">Holdings Copy Entry</span>
      <span className="text-xs text-slate-400 font-medium">Purchased on {holding.purchaseDate}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {!isEditingDetails && (
        <button
          type="button"
          onClick={onStartEdit}
          className="p-1.5 text-slate-500 hover:text-[#FFCB05] hover:bg-slate-850 rounded-lg transition-all cursor-pointer"
          title="Edit Copy Details"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
      <button
        onClick={() => {
          if (setConfirmModal) {
            setConfirmModal({
              isOpen: true,
              title: 'Remove Individual Copy?',
              description: `Are you sure you want to delete this specific copy purchased on ${holding.purchaseDate} for ${currencySymbol}${holding.purchasePrice}? This action is irreversible.`,
              confirmText: 'Yes, Delete Copy',
              cancelText: 'Keep Copy',
              type: 'danger',
              onConfirm: () => onDelete(holding.id)
            });
          } else if (window.confirm('Are you sure you want to delete this copy?')) {
            onDelete(holding.id);
          }
        }}
        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
        title="Delete Copy"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);
