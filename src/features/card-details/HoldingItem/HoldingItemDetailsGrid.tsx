import React from 'react';
import type { CollectionItem, CardQuality } from '../../../types';
import { QUALITY_METADATA } from '../../../data/pokemonData';

interface HoldingItemDetailsGridProps {
  holding: CollectionItem;
  currentPrice: number;
  currencySymbol: string;
  onUpdateQuality?: (id: string, quality: CardQuality) => void;
}

export const HoldingItemDetailsGrid: React.FC<HoldingItemDetailsGridProps> = ({
  holding,
  currentPrice,
  currencySymbol,
  onUpdateQuality
}) => {
  const holdingCost = holding.purchasePrice * holding.quantity;
  const holdingValue = currentPrice * holding.quantity;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-fade-in">
      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">PURCHASE PRICE</span>
        <span className="font-bold text-slate-200 mt-0.5 block font-mono">
          {currencySymbol}{holding.purchasePrice.toLocaleString()}
        </span>
        <span className="text-[9px] text-slate-500 font-mono block">Cost: {currencySymbol}{holdingCost.toLocaleString()}</span>
      </div>

      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">QUANTITY</span>
        <span className="font-bold text-slate-200 mt-0.5 block font-mono">
          {holding.quantity}x
        </span>
        <span className="text-[9px] text-slate-500 font-mono block">Value: {currencySymbol}{holdingValue.toLocaleString()}</span>
      </div>

      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">CONDITION</span>
        <span className="font-bold text-[#FFCB05] mt-0.5 block font-mono">
          {holding.quality || 'NM'}
        </span>
        {onUpdateQuality ? (
          <select
            value={holding.quality || 'NM'}
            onChange={(e) => onUpdateQuality(holding.id, e.target.value as CardQuality)}
            className="w-full bg-slate-900 text-[10px] text-slate-300 border-none outline-none mt-1 p-0.5 rounded cursor-pointer animate-fade-in"
          >
            <option value="M">M - Mint</option>
            <option value="NM">NM - Near Mint</option>
            <option value="SP">SP - Slightly Played</option>
            <option value="MP">MP - Moderately Played</option>
            <option value="HP">HP - Heavily Played</option>
            <option value="D">D - Damaged</option>
          </select>
        ) : (
          <span className="text-[9px] text-slate-500 block truncate">
            {QUALITY_METADATA[holding.quality || 'NM']?.label || 'Near Mint'}
          </span>
        )}
      </div>

      <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">SLAB GRADE</span>
        <span className={`font-bold mt-0.5 block font-mono truncate ${holding.gradeType !== 'Raw' ? 'text-amber-500' : 'text-slate-400'}`}>
          {holding.gradeType} {holding.gradeType !== 'Raw' ? holding.gradeValue : ''}
        </span>
        <span className="text-[9px] text-slate-500 block">
          {holding.gradeType !== 'Raw' ? 'Graded Copy' : 'Raw Copy'}
        </span>
      </div>
    </div>
  );
};
