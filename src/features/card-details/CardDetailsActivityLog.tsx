import React from 'react';
import type { CollectionItem, WishlistItem } from '../../types';

interface CardDetailsActivityLogProps {
  isOwned: boolean;
  isWishlist: boolean;
  collectionItem: CollectionItem | undefined;
  wishlistItem: WishlistItem | undefined;
  currencySymbol: string;
  qty: number;
  purchasePrice: number;
  totalCost: number;
}

export const CardDetailsActivityLog: React.FC<CardDetailsActivityLogProps> = ({
  isOwned,
  isWishlist,
  collectionItem,
  wishlistItem,
  currencySymbol,
  qty,
  purchasePrice,
  totalCost
}) => (
  <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl space-y-3">
    <div className="flex items-center gap-1.5">
      <span className="bg-indigo-400/10 text-indigo-400 px-2 py-0.5 rounded font-bold font-mono text-[9px] tracking-wider uppercase">Collection Activity</span>
      <span className="text-xs text-slate-300 font-bold">Ownership History Log</span>
    </div>

    <div className="space-y-2.5 text-xs">
      {isOwned && collectionItem ? (
        <div className="flex justify-between items-center bg-[#15171e] p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-green-400 font-black block font-mono">ACQUISITION PURCHASE</span>
            <span className="text-slate-400 text-[10px] block mt-0.5 max-w-sm">
              Purchased {qty}x copy on {collectionItem.purchaseDate} for {currencySymbol}{purchasePrice} USD/ea raw model.
            </span>
          </div>
          <span className="font-mono text-[#FFCB05] font-bold">{currencySymbol}{totalCost}</span>
        </div>
      ) : isWishlist && wishlistItem ? (
        <div className="flex justify-between items-center bg-[#15171e] p-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-amber-500 font-black block font-mono">WISHLIST PREFERENCE REGISTERED</span>
            <span className="text-slate-400 text-[10px] block mt-0.5">
              Added target wish seeking acquisition under {currencySymbol}{wishlistItem.desiredPrice}.
            </span>
          </div>
          <span className="font-mono text-slate-300 font-bold">{currencySymbol}{wishlistItem.desiredPrice}</span>
        </div>
      ) : (
        <div className="text-center py-2 text-slate-500 italic text-[11px]">
          No transaction records. Card loaded from catalog view.
        </div>
      )}
    </div>
  </div>
);
