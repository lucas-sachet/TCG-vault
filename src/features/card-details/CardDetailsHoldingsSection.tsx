import React from 'react';
import { Grid } from 'lucide-react';
import type { Card, CollectionItem, Binder, CardQuality } from '../../types';
import type { ConfirmModalConfig, PurchaseDetailsUpdate } from './cardDetailsTypes';
import { HoldingItem } from './HoldingItem';

interface CardDetailsHoldingsSectionProps {
  card: Card;
  cardHoldings: CollectionItem[];
  binders: Binder[];
  currentPrice: number;
  currencySymbol: string;
  totalHoldingsQty: number;
  averageCostBasis: number;
  totalValue: number;
  profitLoss: number;
  roi: number;
  onDeleteCollectionItem: (itemId: string) => void;
  onUpdateCollectionItemNotes: (itemId: string, notes: string) => void;
  onUpdateCollectionItemBinder: (itemId: string, binderId: string) => void;
  onUpdateCollectionItemQuality?: (itemId: string, quality: CardQuality) => void;
  onUpdateCollectionItemPhotos?: (itemId: string, frontPhotoUrl?: string, backPhotoUrl?: string) => void;
  onUpdateCollectionItemPurchaseDetails?: (itemId: string, updates: PurchaseDetailsUpdate) => void;
  setConfirmModal: (config: ConfirmModalConfig) => void;
}

export const CardDetailsHoldingsSection: React.FC<CardDetailsHoldingsSectionProps> = ({
  card,
  cardHoldings,
  binders,
  currentPrice,
  currencySymbol,
  totalHoldingsQty,
  averageCostBasis,
  totalValue,
  profitLoss,
  roi,
  onDeleteCollectionItem,
  onUpdateCollectionItemNotes,
  onUpdateCollectionItemBinder,
  onUpdateCollectionItemQuality,
  onUpdateCollectionItemPhotos,
  onUpdateCollectionItemPurchaseDetails,
  setConfirmModal
}) => (
  <div className="border-t border-slate-800/60 pt-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-extrabold text-sm uppercase text-slate-100 tracking-wider flex items-center gap-2">
        <Grid className="w-4 h-4 text-[#FFCB05]" />
        <span>Owned Copies (Holdings)</span>
      </h3>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#171921] p-3 border border-slate-800 rounded-2xl text-xs">
      <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">Total Holdings</span>
        <span className="text-base font-bold text-white font-mono block mt-0.5">{totalHoldingsQty}x</span>
      </div>
      <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">Average Cost</span>
        <span className="text-base font-bold text-yellow-500 font-mono block mt-0.5">
          {currencySymbol}{Math.round(averageCostBasis).toLocaleString()}
        </span>
      </div>
      <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">Market Value</span>
        <span className="text-base font-bold text-emerald-400 font-mono block mt-0.5">
          {currencySymbol}{Math.round(totalValue).toLocaleString()}
        </span>
      </div>
      <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850">
        <span className="text-[9px] text-slate-500 font-mono block uppercase">Total Growth</span>
        <span className={`text-base font-bold font-mono block mt-0.5 ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {profitLoss >= 0 ? '+' : ''}{roi.toFixed(0)}%
        </span>
      </div>
    </div>

    <div className="space-y-4">
      {cardHoldings.map((holding) => (
        <HoldingItem
          key={holding.id}
          holding={holding}
          card={card}
          currentPrice={currentPrice}
          binders={binders}
          onDelete={onDeleteCollectionItem}
          onUpdateNotes={onUpdateCollectionItemNotes}
          onUpdateBinder={onUpdateCollectionItemBinder}
          onUpdateQuality={onUpdateCollectionItemQuality}
          onUpdatePhotos={onUpdateCollectionItemPhotos}
          onUpdatePurchaseDetails={onUpdateCollectionItemPurchaseDetails}
          currencySymbol={currencySymbol}
          setConfirmModal={setConfirmModal}
        />
      ))}
    </div>
  </div>
);
